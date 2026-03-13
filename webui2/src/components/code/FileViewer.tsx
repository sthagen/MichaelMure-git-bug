import { useState, useEffect } from 'react'
import { Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getRawUrl } from '@/lib/gitApi'
import type { GitBlob } from '@/lib/gitApi'

interface FileViewerProps {
  blob: GitBlob
  ref: string
  loading?: boolean
}

// Syntax-highlighted file viewer with line numbers, copy, and download buttons.
// highlight.js is loaded lazily (dynamic import) so it doesn't bloat the initial bundle.
export function FileViewer({ blob, ref, loading }: FileViewerProps) {
  const [highlighted, setHighlighted] = useState<{ html: string; lineCount: number } | null>(null)

  useEffect(() => {
    if (blob.isBinary || !blob.content) {
      setHighlighted({ html: '', lineCount: 0 })
      return
    }
    setHighlighted(null)
    let cancelled = false
    import('highlight.js').then(({ default: hljs }) => {
      if (cancelled) return
      const ext = blob.path.split('.').pop() ?? ''
      const result = hljs.getLanguage(ext)
        ? hljs.highlight(blob.content, { language: ext })
        : hljs.highlightAuto(blob.content)
      setHighlighted({
        html: result.value,
        lineCount: blob.content.split('\n').length,
      })
    })
    return () => { cancelled = true }
  }, [blob])

  if (loading || highlighted === null) return <FileViewerSkeleton />
  const { html, lineCount } = highlighted

  function copyToClipboard() {
    navigator.clipboard.writeText(blob.content)
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      {/* Metadata bar */}
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        <span>
          {lineCount.toLocaleString()} lines · {formatBytes(blob.size)}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={copyToClipboard}
            title="Copy"
          >
            <Copy className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7" asChild title="Download">
            <a href={getRawUrl(ref, blob.path)} download>
              <Download className="size-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {blob.isBinary ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          Binary file — {formatBytes(blob.size)}
        </div>
      ) : (
        // Line numbers are a fixed column; code scrolls horizontally independently.
        // Keeping them in separate divs avoids having to split highlighted HTML by line.
        <div className="flex overflow-x-auto font-mono text-xs leading-5">
          <div
            className="select-none border-r border-border bg-muted/20 px-4 py-4 text-right text-muted-foreground/50"
            aria-hidden
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <pre className="flex-1 overflow-visible px-4 py-4">
            <code
              className="hljs"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </pre>
        </div>
      )}
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function FileViewerSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="border-b border-border bg-muted/40 px-4 py-2">
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
  )
}
