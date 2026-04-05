// Generic syntax-highlighted search input with pluggable autocomplete providers.
//
// Architecture: two layers share the same font/padding so they appear identical:
//   1. A "backdrop" div (aria-hidden) renders colored <span>s for each token.
//   2. The real <input> floats on top with transparent text and bg, so the caret
//      is visible but the text itself is hidden in favour of the backdrop.

import {
  createContext,
  useContext,
  useState,
  useRef,
  useMemo,
  useEffect,
  type ChangeEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

// ── Public types ──────────────────────────────────────────────────────────────

export interface Suggestion {
  /** What gets inserted into the input (already quoted if needed). */
  value: string;
  /** Display label shown in the dropdown. */
  label: string;
  /** Optional leading decoration (icon, color dot, etc.). */
  icon?: ReactNode;
  /** Optional right-aligned secondary text. */
  description?: string;
}

export interface CompletionProvider {
  /** The prefix this provider handles, including the colon (e.g. "label:"). */
  prefix: string;
  /** Tailwind classes for syntax-highlighting this prefix in the backdrop. */
  highlightClass: string;
  /** Return suggestions for the partial query typed after the prefix. */
  getSuggestions(query: string): Suggestion[] | Promise<Suggestion[]>;
}

/** Static syntax rules for tokens that aren't completable but should be colored. */
export interface SyntaxRule {
  /** Exact token match (e.g. "status:open") or a prefix match (e.g. "sort:"). */
  match: string | ((token: string) => boolean);
  /** Tailwind classes for the prefix/key portion. */
  highlightClass: string;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_SYNTAX_RULES: SyntaxRule[] = [
  { match: "status:open", highlightClass: "text-green-600 dark:text-green-400" },
  { match: "status:closed", highlightClass: "text-purple-600 dark:text-purple-400" },
  { match: (t) => t.startsWith("sort:"), highlightClass: "text-orange-600 dark:text-orange-400" },
];

// ── Segment parsing ───────────────────────────────────────────────────────────

interface Segment {
  text: string;
  highlightClass: string | null;
}

function parseSegments(
  input: string,
  providers: CompletionProvider[],
  syntaxRules: SyntaxRule[],
): Segment[] {
  const segments: Segment[] = [];
  let i = 0;

  while (i < input.length) {
    // Whitespace runs
    if (input[i] === " ") {
      let j = i;
      while (j < input.length && input[j] === " ") j++;
      segments.push({ text: input.slice(i, j), highlightClass: null });
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

    // Check providers first (they also define syntax highlighting)
    let highlightClass: string | null = null;
    for (const p of providers) {
      if (token.startsWith(p.prefix)) {
        highlightClass = p.highlightClass;
        break;
      }
    }

    // Then check static syntax rules
    if (!highlightClass) {
      for (const rule of syntaxRules) {
        const matches =
          typeof rule.match === "string" ? token === rule.match : rule.match(token);
        if (matches) {
          highlightClass = rule.highlightClass;
          break;
        }
      }
    }

    segments.push({ text: token, highlightClass });
    i = j;
  }

  return segments;
}

function renderSegment(seg: Segment, i: number): ReactNode {
  if (!seg.highlightClass) {
    return <span key={i}>{seg.text}</span>;
  }
  const colon = seg.text.indexOf(":");
  if (colon === -1) {
    return (
      <span key={i} className={seg.highlightClass}>
        {seg.text}
      </span>
    );
  }
  const key = seg.text.slice(0, colon + 1);
  const val = seg.text.slice(colon + 1);
  return (
    <span key={i}>
      <span className={seg.highlightClass}>{key}</span>
      <span>{val}</span>
    </span>
  );
}

// ── Cursor / token utilities ──────────────────────────────────────────────────

interface CompletionInfo {
  provider: CompletionProvider;
  query: string;
  tokenStart: number;
}

function getCompletionInfo(
  value: string,
  cursor: number,
  providers: CompletionProvider[],
): CompletionInfo | null {
  let tokenStart = 0;
  for (let i = cursor - 1; i >= 0; i--) {
    if (value[i] === " ") {
      tokenStart = i + 1;
      break;
    }
  }

  const partial = value.slice(tokenStart, cursor);
  for (const provider of providers) {
    if (partial.startsWith(provider.prefix)) {
      const query = partial.slice(provider.prefix.length).replace(/^"/, "");
      return { provider, query, tokenStart };
    }
  }
  return null;
}

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

// ── Context ───────────────────────────────────────────────────────────────────

interface QueryInputContextValue {
  value: string;
  segments: Segment[];
  inputRef: React.RefObject<HTMLInputElement | null>;
  suggestions: Suggestion[];
  activeIndex: number;
  showDropdown: boolean;
  loading: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSelect: (e: React.SyntheticEvent<HTMLInputElement>) => void;
  selectSuggestion: (index: number) => void;
}

const QueryInputContext = createContext<QueryInputContextValue | null>(null);

function useQueryInput() {
  const ctx = useContext(QueryInputContext);
  if (!ctx) throw new Error("QueryInput sub-components must be used within QueryInput.Root");
  return ctx;
}

// ── Components ────────────────────────────────────────────────────────────────

interface RootProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  providers?: CompletionProvider[];
  syntaxRules?: SyntaxRule[];
  className?: string;
  children: ReactNode;
}

export function Root({
  value,
  onChange,
  onSubmit,
  providers = [],
  syntaxRules = DEFAULT_SYNTAX_RULES,
  className,
  children,
}: RootProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [completion, setCompletion] = useState<CompletionInfo | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const segments = useMemo(
    () => parseSegments(value, providers, syntaxRules),
    [value, providers, syntaxRules],
  );

  // Fetch suggestions when completion changes
  useEffect(() => {
    if (!completion) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const result = completion.provider.getSuggestions(completion.query);

    if (result instanceof Promise) {
      setLoading(true);
      void result.then((items) => {
        if (!cancelled) {
          setSuggestions(items);
          setLoading(false);
        }
      });
    } else {
      setSuggestions(result);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [completion]);

  function updateCompletion(newValue: string, cursor: number) {
    const info = getCompletionInfo(newValue, cursor, providers);
    setCompletion(info);
    setActiveIndex(0);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    const cursor = e.target.selectionStart ?? newValue.length;
    onChange(newValue);
    updateCompletion(newValue, cursor);
  }

  function handleSelect(e: React.SyntheticEvent<HTMLInputElement>) {
    updateCompletion(value, e.currentTarget.selectionStart ?? value.length);
  }

  function applySuggestion(s: Suggestion) {
    if (!completion) return;
    const tokenEnd = getTokenEnd(value, completion.tokenStart);
    const completedToken = `${completion.provider.prefix}${s.value}`;
    const newValue =
      value.slice(0, completion.tokenStart) +
      completedToken +
      " " +
      value.slice(tokenEnd).trimStart();
    onChange(newValue);
    setCompletion(null);
    setSuggestions([]);

    const newCursor = completion.tokenStart + completedToken.length + 1;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(newCursor, newCursor);
    });
  }

  function selectSuggestion(index: number) {
    const s = suggestions[index];
    if (s) applySuggestion(s);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !completion) {
      e.preventDefault();
      onSubmit();
      return;
    }

    if (!completion || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      selectSuggestion(activeIndex);
    } else if (e.key === "Escape") {
      setCompletion(null);
      setSuggestions([]);
    }
  }

  const showDropdown = suggestions.length > 0;

  const ctx: QueryInputContextValue = {
    value,
    segments,
    inputRef,
    suggestions,
    activeIndex,
    showDropdown,
    loading,
    handleChange,
    handleKeyDown,
    handleSelect,
    selectSuggestion,
  };

  return (
    <QueryInputContext value={ctx}>
      <div
        className={cn(
          "relative flex flex-1 items-center rounded-md border border-input bg-background",
          "ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className,
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {children}
      </div>
    </QueryInputContext>
  );
}

interface IconProps {
  children: ReactNode;
}

export function Icon({ children }: IconProps) {
  return (
    <div className="text-muted-foreground pointer-events-none absolute left-3 flex size-4 shrink-0 items-center justify-center [&>svg]:size-4">
      {children}
    </div>
  );
}

interface InputProps {
  placeholder?: string;
  className?: string;
}

export function Input({ placeholder, className }: InputProps) {
  const { value, segments, inputRef, handleChange, handleKeyDown, handleSelect } = useQueryInput();

  return (
    <>
      {/* Colored backdrop */}
      <div
        aria-hidden
        className="text-foreground pointer-events-none absolute inset-0 flex items-center overflow-hidden pr-3 pl-9 font-mono text-sm whitespace-pre"
      >
        {value === "" ? null : segments.map((seg, i) => renderSegment(seg, i))}
      </div>

      {/* Actual input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        className={cn(
          "caret-foreground placeholder:text-muted-foreground relative w-full bg-transparent py-2 pr-3 pl-9 font-mono text-sm text-transparent outline-hidden placeholder:font-sans",
          className,
        )}
        spellCheck={false}
        autoComplete="off"
      />
    </>
  );
}

export function Completions() {
  const { suggestions, activeIndex, showDropdown, loading, selectSuggestion } = useQueryInput();

  if (!showDropdown && !loading) return null;

  return (
    <div className="border-border bg-popover absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-md border shadow-md">
      {loading && suggestions.length === 0 && (
        <div className="text-muted-foreground px-3 py-2 text-sm">Loading…</div>
      )}
      {suggestions.map((s, i) => (
        <button
          key={`${s.value}-${s.label}`}
          onMouseDown={(e) => {
            e.preventDefault();
            selectSuggestion(i);
          }}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm",
            i === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted",
          )}
        >
          {s.icon}
          <span className="font-mono">{s.label}</span>
          {s.description && (
            <span className="text-muted-foreground ml-auto text-xs">{s.description}</span>
          )}
        </button>
      ))}
    </div>
  );
}
