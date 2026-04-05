// Syntax-highlighted file viewer with clickable line numbers.
// Uses Shiki codeToHast → hast-util-to-jsx-runtime for native React rendering.
// Line selection syncs with the URL hash (e.g. #L12 or #L12:25).

import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Copy } from "lucide-react";
import { useState, useEffect, useCallback, useMemo, Fragment, type ReactNode } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

import type { GitBlob } from "@/__generated__/graphql";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ── Shiki highlighter (lazy singleton) ────────────────────────────────────────

let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        import("@shikijs/themes/github-light"),
        import("@shikijs/themes/github-dark"),
      ],
      langs: [],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    });
  }
  return highlighterPromise;
}

interface LangEntry {
  id: string;
  load: () => Promise<unknown>;
}

const LANG_MAP: Record<string, LangEntry> = {
  js: { id: "javascript", load: () => import("@shikijs/langs/javascript") },
  mjs: { id: "javascript", load: () => import("@shikijs/langs/javascript") },
  cjs: { id: "javascript", load: () => import("@shikijs/langs/javascript") },
  jsx: { id: "jsx", load: () => import("@shikijs/langs/jsx") },
  ts: { id: "typescript", load: () => import("@shikijs/langs/typescript") },
  mts: { id: "typescript", load: () => import("@shikijs/langs/typescript") },
  cts: { id: "typescript", load: () => import("@shikijs/langs/typescript") },
  tsx: { id: "tsx", load: () => import("@shikijs/langs/tsx") },
  html: { id: "html", load: () => import("@shikijs/langs/html") },
  css: { id: "css", load: () => import("@shikijs/langs/css") },
  scss: { id: "scss", load: () => import("@shikijs/langs/scss") },
  json: { id: "json", load: () => import("@shikijs/langs/json") },
  jsonc: { id: "jsonc", load: () => import("@shikijs/langs/jsonc") },
  yaml: { id: "yaml", load: () => import("@shikijs/langs/yaml") },
  yml: { id: "yaml", load: () => import("@shikijs/langs/yaml") },
  toml: { id: "toml", load: () => import("@shikijs/langs/toml") },
  xml: { id: "xml", load: () => import("@shikijs/langs/xml") },
  svg: { id: "xml", load: () => import("@shikijs/langs/xml") },
  graphql: { id: "graphql", load: () => import("@shikijs/langs/graphql") },
  sql: { id: "sql", load: () => import("@shikijs/langs/sql") },
  md: { id: "markdown", load: () => import("@shikijs/langs/markdown") },
  mdx: { id: "mdx", load: () => import("@shikijs/langs/mdx") },
  sh: { id: "bash", load: () => import("@shikijs/langs/bash") },
  bash: { id: "bash", load: () => import("@shikijs/langs/bash") },
  zsh: { id: "bash", load: () => import("@shikijs/langs/bash") },
  go: { id: "go", load: () => import("@shikijs/langs/go") },
  rs: { id: "rust", load: () => import("@shikijs/langs/rust") },
  c: { id: "c", load: () => import("@shikijs/langs/c") },
  h: { id: "c", load: () => import("@shikijs/langs/c") },
  cpp: { id: "cpp", load: () => import("@shikijs/langs/cpp") },
  hpp: { id: "cpp", load: () => import("@shikijs/langs/cpp") },
  py: { id: "python", load: () => import("@shikijs/langs/python") },
  rb: { id: "ruby", load: () => import("@shikijs/langs/ruby") },
  lua: { id: "lua", load: () => import("@shikijs/langs/lua") },
  java: { id: "java", load: () => import("@shikijs/langs/java") },
  kt: { id: "kotlin", load: () => import("@shikijs/langs/kotlin") },
  swift: { id: "swift", load: () => import("@shikijs/langs/swift") },
  nix: { id: "nix", load: () => import("@shikijs/langs/nix") },
  Dockerfile: { id: "dockerfile", load: () => import("@shikijs/langs/dockerfile") },
  Makefile: { id: "makefile", load: () => import("@shikijs/langs/makefile") },
};

function getLangEntry(path: string): LangEntry | undefined {
  const filename = path.split("/").pop() ?? "";
  const ext = filename.split(".").pop() ?? "";
  return LANG_MAP[ext] ?? LANG_MAP[filename];
}

// ── Line selection from URL hash ──────────────────────────────────────────────

interface LineRange {
  start: number;
  end: number;
}

function parseHash(hash: string): LineRange | null {
  const match = /^#?L(\d+)(?::(\d+))?$/.exec(hash);
  if (!match) return null;
  const start = parseInt(match[1]!, 10);
  const end = match[2] ? parseInt(match[2], 10) : start;
  return { start: Math.min(start, end), end: Math.max(start, end) };
}

function buildHash(range: LineRange): string {
  return range.start === range.end ? `#L${range.start}` : `#L${range.start}:${range.end}`;
}

function isLineSelected(line: number, range: LineRange | null): boolean {
  if (!range) return false;
  return line >= range.start && line <= range.end;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface FileViewerProps {
  blob: GitBlob | null;
}

export function FileViewer({ blob }: FileViewerProps) {
  if (!blob) {
    return (
      <div className="divide-border border-border divide-y rounded-md border">
        <div className="flex items-center gap-2 px-4 py-2">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="p-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const [highlighted, setHighlighted] = useState<{ node: ReactNode; lineCount: number } | null>(
    null,
  );
  const [selectedRange, setSelectedRange] = useState<LineRange | null>(() =>
    parseHash(window.location.hash),
  );

  // Sync hash → state on popstate
  useEffect(() => {
    function onHashChange() {
      setSelectedRange(parseHash(window.location.hash));
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Scroll to selected line on initial load
  useEffect(() => {
    if (selectedRange && highlighted) {
      const el = document.getElementById(`L${selectedRange.start}`);
      el?.scrollIntoView({ block: "center" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only scroll on first render
  }, [highlighted]);

  const handleLineClick = useCallback(
    (lineNumber: number, shiftKey: boolean) => {
      let newRange: LineRange;
      if (shiftKey && selectedRange) {
        // Extend from the existing anchor
        const anchor = selectedRange.start;
        newRange = {
          start: Math.min(anchor, lineNumber),
          end: Math.max(anchor, lineNumber),
        };
      } else {
        newRange = { start: lineNumber, end: lineNumber };
      }
      setSelectedRange(newRange);
      window.history.replaceState(null, "", buildHash(newRange));
    },
    [selectedRange],
  );

  useEffect(() => {
    if (blob.isBinary || !blob.text) {
      setHighlighted({ node: null, lineCount: 0 });
      return;
    }
    setHighlighted(null);
    let cancelled = false;

    void (async () => {
      const highlighter = await getHighlighter();
      const entry = getLangEntry(blob.path);

      let lang = "text";
      if (entry) {
        try {
          const langModule = await entry.load();
          await highlighter.loadLanguage(
            langModule as Parameters<typeof highlighter.loadLanguage>[0],
          );
          lang = entry.id;
        } catch {
          // Language not available — fall back to plain text
        }
      }

      if (cancelled) return;

      const hast = highlighter.codeToHast(blob.text!, {
        lang,
        themes: { light: "github-light", dark: "github-dark" },
      });

      const node = toJsxRuntime(hast, {
        Fragment,
        jsx,
        jsxs,
      });

      setHighlighted({
        node,
        lineCount: blob.text!.split("\n").length,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [blob]);

  if (highlighted === null) return <FileViewerSkeleton />;
  const { lineCount } = highlighted;

  function copyToClipboard() {
    if (blob?.text) void navigator.clipboard.writeText(blob.text);
  }

  return (
    <div className="border-border overflow-hidden rounded-md border">
      <div className="border-border bg-muted/40 text-muted-foreground flex items-center justify-between border-b px-4 py-2 text-xs">
        <span>
          {lineCount.toLocaleString()} lines · {formatBytes(blob.size)}
          {blob.isTruncated && " · truncated"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={copyToClipboard}
          title="Copy"
        >
          <Copy className="size-3.5" />
        </Button>
      </div>

      {blob.isBinary ? (
        <div className="text-muted-foreground px-4 py-8 text-center text-sm">
          Binary file — {formatBytes(blob.size)}
        </div>
      ) : (
        <CodeWithLineNumbers
          lineCount={lineCount}
          selectedRange={selectedRange}
          onLineClick={handleLineClick}
        >
          {highlighted.node}
        </CodeWithLineNumbers>
      )}
    </div>
  );
}

// ── Line numbers + highlighting ───────────────────────────────────────────────

interface CodeWithLineNumbersProps {
  lineCount: number;
  selectedRange: LineRange | null;
  onLineClick: (line: number, shiftKey: boolean) => void;
  children: ReactNode;
}

function CodeWithLineNumbers({
  lineCount,
  selectedRange,
  onLineClick,
  children,
}: CodeWithLineNumbersProps) {
  return (
    <div className="flex overflow-x-auto font-mono text-xs leading-5">
      {/* Line number gutter */}
      <div
        className="bg-muted/20 border-border sticky left-0 border-r py-4 text-right select-none"
        aria-hidden
      >
        {Array.from({ length: lineCount }, (_, i) => {
          const line = i + 1;
          const selected = isLineSelected(line, selectedRange);
          return (
            <a
              key={line}
              id={`L${line}`}
              href={`#L${line}`}
              className={cn(
                "block px-4 text-muted-foreground/50 hover:text-muted-foreground",
                selected && "bg-accent/40 text-accent-foreground",
              )}
              onClick={(e) => {
                e.preventDefault();
                onLineClick(line, e.shiftKey);
              }}
            >
              {line}
            </a>
          );
        })}
      </div>

      {/* Code content — Shiki renders <pre><code><span class="line">... */}
      <div
        className={cn(
          "flex-1 py-4 [&_.shiki]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code_.line]:block [&_code_.line]:px-4",
          selectedRange && "[&_code_.line.highlighted]:bg-accent/40",
        )}
      >
        <LineHighlighter selectedRange={selectedRange} lineCount={lineCount}>
          {children}
        </LineHighlighter>
      </div>
    </div>
  );
}

// Wraps Shiki output and adds "highlighted" class to selected .line spans via CSS
function LineHighlighter({
  selectedRange,
  lineCount,
  children,
}: {
  selectedRange: LineRange | null;
  lineCount: number;
  children: ReactNode;
}) {
  // Generate a CSS rule that highlights the selected lines via :nth-child
  const style = useMemo(() => {
    if (!selectedRange) return undefined;
    const selectors: string[] = [];
    for (let i = selectedRange.start; i <= selectedRange.end && i <= lineCount; i++) {
      selectors.push(`.line-highlight-scope code > .line:nth-child(${i})`);
    }
    if (selectors.length === 0) return undefined;
    return (
      <style>{`${selectors.join(",")}{background:var(--color-accent);opacity:0.4;background:color-mix(in srgb, var(--color-accent) 40%, transparent)}`}</style>
    );
  }, [selectedRange, lineCount]);

  return (
    <div className="line-highlight-scope">
      {style}
      {children}
    </div>
  );
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function FileViewerSkeleton() {
  return (
    <div className="border-border overflow-hidden rounded-md border">
      <div className="border-border bg-muted/40 border-b px-4 py-2">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex gap-4 p-4">
        <div className="space-y-1.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="h-3.5 w-6" />
          ))}
        </div>
        <div className="flex-1 space-y-1.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="h-3.5" style={{ width: `${30 + ((i * 47) % 60)}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
