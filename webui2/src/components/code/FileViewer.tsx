import { useMemo } from 'react'
import hljs from 'highlight.js'
import { Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { GitBlob } from '@/lib/gitApi'

interface FileViewerProps {
  blob: GitBlob
  loading?: boolean
}

// Syntax-highlighted file viewer with line numbers, copy, and download buttons.
// Uses highlight.js for highlighting; binary files show a placeholder.
export function FileViewer({ blob, loading }: FileViewerProps) {
  const { html, lineCount } = useMemo(() => {
    if (blob.isBinary || !blob.content) return { html: '', lineCount: 0 }
    const ext = blob.path.split('.').pop() ?? ''
    const result = hljs.getLanguage(ext)
      ? hljs.highlight(blob.content, { language: ext })
      : hljs.highlightAuto(blob.content)
    return {
      html: result.value,
      lineCount: blob.content.split('\n').length,
    }
  }, [blob])

  if (loading) return <FileViewerSkeleton />

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
            <a href={`/gitfile/default/${blob.path}`} download>
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
