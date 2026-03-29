// Syntax-highlighted search input with label/author autocomplete.
//
// Architecture: two layers share the same font/padding so they appear identical:
//   1. A "backdrop" div (aria-hidden) renders colored <span>s for each token.
//   2. The real <input> floats on top with transparent text and bg, so the caret
//      is visible but the text itself is hidden in favour of the backdrop.
//
// Autocomplete: when the cursor is inside a `label:` or `author:` token, a
// dropdown appears with filtered suggestions fetched from GraphQL. Clicking or
// keyboard-selecting a suggestion replaces the current token in the input.

import { Search } from "lucide-react";
import { useState, useRef, useMemo, type ChangeEvent } from "react";

import { useValidLabelsQuery, useAllIdentitiesQuery } from "@/__generated__/graphql";
import { useRepo } from "@/lib/repo";
import { cn } from "@/lib/utils";

// ── Segment parsing (for the syntax-highlight backdrop) ───────────────────────

type SegmentType = "status-open" | "status-closed" | "label" | "author" | "text" | "space";

interface Segment {
  text: string;
  type: SegmentType;
}

// Parse the query string into typed segments, preserving all whitespace.
// Walks char-by-char so that quoted values (e.g. label:"my label") are kept as
// a single token and spaces inside quotes don't split the segment.
function parseSegments(input: string): Segment[] {
  const segments: Segment[] = [];
  let i = 0;

  while (i < input.length) {
    // Whitespace runs — preserved as a separate 'space' segment so the backdrop
    // can use whitespace-pre and match the input exactly.
    if (input[i] === " ") {
      let j = i;
      while (j < input.length && input[j] === " ") j++;
      segments.push({ text: input.slice(i, j), type: "space" });
      i = j;
      continue;
    }

    // Token — consume until an unquoted space
    let j = i;
    let inQuote = false;
    while (j < input.length) {
      if (input[j] === '"') {
        inQuote = !inQuote;
        j++;
        continue;
      }
      if (!inQuote && input[j] === " ") break;
      j++;
    }

    const token = input.slice(i, j);
    let type: SegmentType = "text";
    if (token === "status:open") type = "status-open";
    else if (token === "status:closed") type = "status-closed";
    else if (token.startsWith("label:")) type = "label";
    else if (token.startsWith("author:")) type = "author";

    segments.push({ text: token, type });
    i = j;
  }

  return segments;
}

// Only the key portion (e.g. "label:") is colored; the value stays in foreground.
function renderSegment(seg: Segment, i: number): React.ReactNode {
  if (seg.type === "space" || seg.type === "text") {
    return <span key={i}>{seg.text}</span>;
  }
  const colon = seg.text.indexOf(":");
  const key = seg.text.slice(0, colon + 1);
  const val = seg.text.slice(colon + 1);

  const keyClass =
    seg.type === "status-open"
      ? "text-green-600 dark:text-green-400"
      : seg.type === "status-closed"
        ? "text-purple-600 dark:text-purple-400"
        : seg.type === "label"
          ? "text-yellow-600 dark:text-yellow-500"
          : /* author */ "text-blue-600 dark:text-blue-400";

  return (
    <span key={i}>
      <span className={keyClass}>{key}</span>
      <span>{val}</span>
    </span>
  );
}

// ── Autocomplete logic ────────────────────────────────────────────────────────

interface CompletionInfo {
  type: "label" | "author";
  /** Text typed after the prefix (e.g. "bu" for "label:bu"). Quotes stripped. */
  query: string;
  /** Byte position in `value` where the current token starts. */
  tokenStart: number;
}

// Inspects the text to the left of `cursor` to determine if the user is in the
// middle of a `label:` or `author:` token and what they've typed so far.
// Returns null when not in an autocomplete-eligible position.
function getCompletionInfo(value: string, cursor: number): CompletionInfo | null {
  // Walk backward to find the start of the current token
  let tokenStart = 0;
  for (let i = cursor - 1; i >= 0; i--) {
    if (value[i] === " ") {
      tokenStart = i + 1;
      break;
    }
  }

  const partial = value.slice(tokenStart, cursor);
  if (partial.startsWith("label:")) {
    return { type: "label", query: partial.slice(6), tokenStart };
  }
  if (partial.startsWith("author:")) {
    // Strip a leading quote that the user may have typed
    return { type: "author", query: partial.slice(7).replace(/^"/, ""), tokenStart };
  }
  return null;
}

// Find where the current token ends (next unquoted space, or end of string).
// Used when replacing a token on suggestion selection so we don't leave stale text.
function getTokenEnd(value: string, tokenStart: number): number {
  let inQuote = false;
  for (let i = tokenStart; i < value.length; i++) {
    if (value[i] === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (!inQuote && value[i] === " ") return i;
  }
  return value.length;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface QueryInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
}

export function QueryInput({ value, onChange, onSubmit, placeholder, className }: QueryInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const repo = useRepo();

  // Autocomplete state: null when the dropdown is hidden.
  const [completion, setCompletion] = useState<CompletionInfo | null>(null);
  // Keyboard-highlighted index within the visible suggestions list.
  const [acIndex, setAcIndex] = useState(0);

  // Fetch all labels and identities for autocomplete suggestions.
  // These queries are cheap (cached by Apollo) and already used by IssueFilters,
  // so there is no extra network cost.
  const { data: labelsData } = useValidLabelsQuery({ variables: { ref: repo } });
  const { data: authorsData } = useAllIdentitiesQuery({ variables: { ref: repo } });

  const allLabels = useMemo(() => labelsData?.repository?.validLabels.nodes ?? [], [labelsData]);
  const allAuthors = useMemo(
    () => authorsData?.repository?.allIdentities.nodes ?? [],
    [authorsData],
  );

  // Compute the filtered suggestion list whenever completion info changes.
  const suggestions = useMemo(() => {
    if (!completion) return [];

    if (completion.type === "label") {
      const q = completion.query.toLowerCase();
      return allLabels
        .filter((l) => q === "" || l.name.toLowerCase().includes(q))
        .slice(0, 8)
        .map((l) => ({
          display: l.name,
          // Quote the token value if the label name contains a space
          completedToken: `label:${l.name.includes(" ") ? `"${l.name}"` : l.name}`,
          color: l.color,
        }));
    }

    // author suggestions — match against displayName, login, and name
    const q = completion.query.toLowerCase();
    return allAuthors
      .filter(
        (a) =>
          q === "" ||
          a.displayName.toLowerCase().includes(q) ||
          (a.login ?? "").toLowerCase().includes(q) ||
          (a.name ?? "").toLowerCase().includes(q),
      )
      .slice(0, 8)
      .map((a) => {
        // Prefer login (no spaces, stable) → name → humanId as the query value.
        // Same preference used by IssueFilters.authorQueryValue.
        const qv = a.login ?? a.name ?? a.humanId;
        return {
          display: a.displayName,
          completedToken: `author:${qv.includes(" ") ? `"${qv}"` : qv}`,
          color: null,
        };
      });
  }, [completion, allLabels, allAuthors]);

  // ── Recompute completion state after every input change or cursor move ──────

  function updateCompletion(newValue: string, cursor: number) {
    const info = getCompletionInfo(newValue, cursor);
    setCompletion(info);
    setAcIndex(0);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    const cursor = e.target.selectionStart ?? newValue.length;
    onChange(newValue);
    updateCompletion(newValue, cursor);
  }

  // onSelect fires on cursor movement (arrow keys, click-to-reposition), which
  // lets us show/hide the dropdown correctly when the cursor moves into or out
  // of an autocomplete-eligible token without changing the text.
  function handleSelect(e: React.SyntheticEvent<HTMLInputElement>) {
    updateCompletion(value, e.currentTarget.selectionStart ?? value.length);
  }

  // ── Keyboard navigation ───────────────────────────────────────────────────

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !completion) {
      e.preventDefault();
      onSubmit();
      return;
    }

    if (!completion || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAcIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAcIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const suggestion = suggestions[acIndex];
      if (suggestion) applySuggestion(suggestion);
    } else if (e.key === "Escape") {
      setCompletion(null);
    }
  }

  // ── Apply a selected suggestion ──────────────────────────────────────────

  function applySuggestion(s: { completedToken: string }) {
    if (!completion) return;
    const tokenEnd = getTokenEnd(value, completion.tokenStart);
    // Replace the current token (from tokenStart to tokenEnd) with the completed
    // token, then add a space so the user can type the next filter immediately.
    const newValue =
      value.slice(0, completion.tokenStart) +
      s.completedToken +
      " " +
      value.slice(tokenEnd).trimStart();
    onChange(newValue);
    setCompletion(null);

    // Restore focus and position cursor after the inserted token + space
    const newCursor = completion.tokenStart + s.completedToken.length + 1;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(newCursor, newCursor);
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const segments = parseSegments(value);
  const showDropdown = completion !== null && suggestions.length > 0;

  return (
    <div
      className={cn(
        "relative flex-1 flex items-center rounded-md border border-input bg-background",
        "ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      <Search className="text-muted-foreground pointer-events-none absolute left-3 size-4 shrink-0" />

      {/* Colored backdrop — same font/size/padding as the input. aria-hidden so
          screen readers only see the real input, not the duplicate text. */}
      <div
        aria-hidden
        className="text-foreground pointer-events-none absolute inset-0 flex items-center overflow-hidden pr-3 pl-9 font-mono text-sm whitespace-pre"
      >
        {value === "" ? null : segments.map((seg, i) => renderSegment(seg, i))}
      </div>

      {/* Actual input — transparent bg and text so the backdrop shows through.
          caret-foreground keeps the cursor visible despite text-transparent. */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        className="caret-foreground placeholder:text-muted-foreground relative w-full bg-transparent py-2 pr-3 pl-9 font-mono text-sm text-transparent outline-hidden placeholder:font-sans"
        spellCheck={false}
        autoComplete="off"
      />

      {/* Autocomplete dropdown — positioned below the input via absolute+top-full.
          Uses onMouseDown+preventDefault so clicking a suggestion doesn't blur
          the input before the click registers (classic focus-race problem). */}
      {showDropdown && (
        <div className="border-border bg-popover absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-md border shadow-md">
          {suggestions.map((s, i) => (
            <button
              key={s.completedToken}
              onMouseDown={(e) => {
                e.preventDefault();
                applySuggestion(s);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm",
                i === acIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted",
              )}
            >
              {s.color && (
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: `rgb(${s.color.R},${s.color.G},${s.color.B})` }}
                />
              )}
              <span className="font-mono">{s.completedToken}</span>
              {s.display !== s.completedToken.split(":")[1]?.replace(/"/g, "") && (
                <span className="text-muted-foreground ml-auto text-xs">{s.display}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
