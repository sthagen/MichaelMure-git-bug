// Collapsible diff view for a single file in a commit.
// Diff is fetched lazily on first expand to avoid loading large diffs upfront.

import { useState } from 'react'
import { ChevronRight, FilePlus, FileMinus, FileEdit } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCommitDiff } from '@/lib/gitApi'
import type { FileDiff, DiffHunk } from '@/lib/gitApi'

interface FileDiffViewProps {
  sha: string
  path: string
  oldPath?: string
  status: 'added' | 'modified' | 'deleted' | 'renamed'
}

const statusIcon = {
  added:    <FilePlus  className="size-3.5 text-green-600 dark:text-green-400" />,
  deleted:  <FileMinus className="size-3.5 text-red-500  dark:text-red-400" />,
  modified: <FileEdit  className="size-3.5 text-yellow-500 dark:text-yellow-400" />,
  renamed:  <FileEdit  className="size-3.5 text-blue-500  dark:text-blue-400" />,
}

const statusBadge = { added: 'A', deleted: 'D', modified: 'M', renamed: 'R' }

export function FileDiffView({ sha, path, oldPath, status }: FileDiffViewProps) {
  const [open, setOpen] = useState(false)
  const [diff, setDiff] = useState<FileDiff | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle() {
    if (!open && diff === null && !loading) {
      setLoading(true)
      getCommitDiff(sha, path)
        .then(setDiff)
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false))
    }
    setOpen((v) => !v)
  }

  return (
    <div className="divide-y divide-border">
      {/* File header row — always visible, click to toggle */}
      <button
        onClick={toggle}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors"
      >
        <ChevronRight
          className={cn(
            'size-3.5 shrink-0 text-muted-foreground transition-transform duration-150',
            open && 'rotate-90',
          )}
        />
        {statusIcon[status]}
        <span className="min-w-0 flex-1 font-mono text-sm">
          {status === 'renamed' ? (
            <>
              <span className="text-muted-foreground line-through">{oldPath}</span>
              {' → '}
              <span>{path}</span>
            </>
          ) : path}
        </span>
        <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
          {statusBadge[status]}
        </span>
      </button>

      {/* Diff body */}
      {open && (
        <div className="overflow-x-auto">
          {loading && (
            <div className="px-4 py-3 text-xs text-muted-foreground">Loading diff…</div>
          )}
          {error && (
            <div className="px-4 py-3 text-xs text-destructive">Failed to load diff: {error}</div>
          )}
          {diff && (
            diff.isBinary ? (
              <div className="px-4 py-3 text-xs text-muted-foreground">Binary file</div>
            ) : diff.hunks.length === 0 ? (
              <div className="px-4 py-3 text-xs text-muted-foreground">No changes</div>
            ) : (
              diff.hunks.map((hunk, i) => <Hunk key={i} hunk={hunk} />)
            )
          )}
        </div>
      )}
    </div>
  )
}

function Hunk({ hunk }: { hunk: DiffHunk }) {
  return (
    <div className="font-mono text-xs leading-5">
      {/* Hunk header */}
      <div className="bg-blue-50 px-4 py-0.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 select-none">
        @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
      </div>
      {hunk.lines.map((line, i) => (
        <div
          key={i}
          className={cn(
            'flex',
            line.type === 'added'   && 'bg-green-50  dark:bg-green-950/30',
            line.type === 'deleted' && 'bg-red-50    dark:bg-red-950/30',
          )}
        >
          {/* Old line number */}
          <span className="w-10 shrink-0 select-none border-r border-border/50 px-2 text-right text-muted-foreground/50">
            {line.oldLine || ''}
          </span>
          {/* New line number */}
          <span className="w-10 shrink-0 select-none border-r border-border/50 px-2 text-right text-muted-foreground/50">
            {line.newLine || ''}
          </span>
          {/* Sign */}
          <span className={cn(
            'w-5 shrink-0 select-none text-center',
            line.type === 'added'   && 'text-green-600 dark:text-green-400',
            line.type === 'deleted' && 'text-red-500   dark:text-red-400',
            line.type === 'context' && 'text-muted-foreground/40',
          )}>
            {line.type === 'added' ? '+' : line.type === 'deleted' ? '-' : ' '}
          </span>
          {/* Content */}
          <pre className={cn(
            'flex-1 overflow-visible whitespace-pre px-2',
            line.type === 'added'   && 'text-green-900 dark:text-green-200',
            line.type === 'deleted' && 'text-red-900   dark:text-red-200',
          )}>
            {line.content}
          </pre>
        </div>
      ))}
    </div>
  )
}
