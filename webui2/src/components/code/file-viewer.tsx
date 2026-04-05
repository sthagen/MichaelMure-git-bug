// Syntax-highlighted file viewer with line numbers and copy button.
// Uses Shiki (VS Code's grammar engine) for accurate highlighting.
// The highlighter is created lazily on first use and cached.

import { Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

import type { GitBlob } from "@/__generated__/graphql";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy singleton — created once, reused across all FileViewer instances.
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

// Map file extensions / filenames → [shiki lang ID, lazy import].
// Languages are loaded on demand — only the ones actually viewed get fetched.
interface LangEntry {
  id: string;
  load: () => Promise<unknown>;
}

const LANG_MAP: Record<string, LangEntry> = {
  // JavaScript / TypeScript
  js: { id: "javascript", load: () => import("@shikijs/langs/javascript") },
  mjs: { id: "javascript", load: () => import("@shikijs/langs/javascript") },
  cjs: { id: "javascript", load: () => import("@shikijs/langs/javascript") },
  jsx: { id: "jsx", load: () => import("@shikijs/langs/jsx") },
  ts: { id: "typescript", load: () => import("@shikijs/langs/typescript") },
  mts: { id: "typescript", load: () => import("@shikijs/langs/typescript") },
  cts: { id: "typescript", load: () => import("@shikijs/langs/typescript") },
  tsx: { id: "tsx", load: () => import("@shikijs/langs/tsx") },
  // Web
  html: { id: "html", load: () => import("@shikijs/langs/html") },
  css: { id: "css", load: () => import("@shikijs/langs/css") },
  scss: { id: "scss", load: () => import("@shikijs/langs/scss") },
  // Data
  json: { id: "json", load: () => import("@shikijs/langs/json") },
  jsonc: { id: "jsonc", load: () => import("@shikijs/langs/jsonc") },
  yaml: { id: "yaml", load: () => import("@shikijs/langs/yaml") },
  yml: { id: "yaml", load: () => import("@shikijs/langs/yaml") },
  toml: { id: "toml", load: () => import("@shikijs/langs/toml") },
  xml: { id: "xml", load: () => import("@shikijs/langs/xml") },
  svg: { id: "xml", load: () => import("@shikijs/langs/xml") },
  graphql: { id: "graphql", load: () => import("@shikijs/langs/graphql") },
  sql: { id: "sql", load: () => import("@shikijs/langs/sql") },
  // Docs
  md: { id: "markdown", load: () => import("@shikijs/langs/markdown") },
  mdx: { id: "mdx", load: () => import("@shikijs/langs/mdx") },
  // Shell
  sh: { id: "bash", load: () => import("@shikijs/langs/bash") },
  bash: { id: "bash", load: () => import("@shikijs/langs/bash") },
  zsh: { id: "bash", load: () => import("@shikijs/langs/bash") },
  // Systems
  go: { id: "go", load: () => import("@shikijs/langs/go") },
  rs: { id: "rust", load: () => import("@shikijs/langs/rust") },
  c: { id: "c", load: () => import("@shikijs/langs/c") },
  h: { id: "c", load: () => import("@shikijs/langs/c") },
  cpp: { id: "cpp", load: () => import("@shikijs/langs/cpp") },
  hpp: { id: "cpp", load: () => import("@shikijs/langs/cpp") },
  // Scripting
  py: { id: "python", load: () => import("@shikijs/langs/python") },
  rb: { id: "ruby", load: () => import("@shikijs/langs/ruby") },
  lua: { id: "lua", load: () => import("@shikijs/langs/lua") },
  // JVM / Mobile
  java: { id: "java", load: () => import("@shikijs/langs/java") },
  kt: { id: "kotlin", load: () => import("@shikijs/langs/kotlin") },
  swift: { id: "swift", load: () => import("@shikijs/langs/swift") },
  // Infra
  nix: { id: "nix", load: () => import("@shikijs/langs/nix") },
  // Filenames
  Dockerfile: { id: "dockerfile", load: () => import("@shikijs/langs/dockerfile") },
  Makefile: { id: "makefile", load: () => import("@shikijs/langs/makefile") },
};

function getLangEntry(path: string): LangEntry | undefined {
  const filename = path.split("/").pop() ?? "";
  const ext = filename.split(".").pop() ?? "";
  return LANG_MAP[ext] ?? LANG_MAP[filename];
}

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
  const [highlighted, setHighlighted] = useState<{ html: string; lineCount: number } | null>(null);

  useEffect(() => {
    if (blob.isBinary || !blob.text) {
      setHighlighted({ html: "", lineCount: 0 });
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
          await highlighter.loadLanguage(langModule as Parameters<typeof highlighter.loadLanguage>[0]);
          lang = entry.id;
        } catch {
          // Language not available — fall back to plain text
        }
      }

      if (cancelled) return;

      const html = highlighter.codeToHtml(blob.text!, {
        lang,
        themes: { light: "github-light", dark: "github-dark" },
      });

      setHighlighted({
        html,
        lineCount: blob.text!.split("\n").length,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [blob]);

  if (highlighted === null) return <FileViewerSkeleton />;
  const { html, lineCount } = highlighted;

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
        <div
          className="overflow-x-auto font-mono text-xs leading-5 [&_.shiki]:!bg-transparent [&_pre]:px-4 [&_pre]:py-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}

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
