// Syntax-highlighted file viewer with line numbers and copy button.
// highlight.js is loaded lazily so it doesn't bloat the initial bundle.

import { Copy } from "lucide-react";
import { useState, useEffect } from "react";

import type { GitBlob } from "@/__generated__/graphql";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface FileViewerProps {
  blob: GitBlob;
  loading?: boolean;
}

export function FileViewer({ blob, loading }: FileViewerProps) {
  const [highlighted, setHighlighted] = useState<{ html: string; lineCount: number } | null>(null);

  useEffect(() => {
    if (blob.isBinary || !blob.text) {
      setHighlighted({ html: "", lineCount: 0 });
      return;
    }
    setHighlighted(null);
    let cancelled = false;
    void import("highlight.js").then(({ default: hljs }) => {
      if (cancelled) return;
      const ext = blob.path.split(".").pop() ?? "";
      const result = hljs.getLanguage(ext)
        ? hljs.highlight(blob.text!, { language: ext })
        : hljs.highlightAuto(blob.text!);
      setHighlighted({
        html: result.value,
        lineCount: blob.text!.split("\n").length,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [blob]);

  if (loading || highlighted === null) return <FileViewerSkeleton />;
  const { html, lineCount } = highlighted;

  function copyToClipboard() {
    if (blob.text) void navigator.clipboard.writeText(blob.text);
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
        <div className="flex overflow-x-auto font-mono text-xs leading-5">
          <div
            className="border-border bg-muted/20 text-muted-foreground/50 border-r px-4 py-4 text-right select-none"
            aria-hidden
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <pre className="flex-1 overflow-visible px-4 py-4">
            <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
          </pre>
        </div>
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
            <Skeleton key={i} className="h-3.5" style={{ width: `${30 + Math.random() * 60}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
