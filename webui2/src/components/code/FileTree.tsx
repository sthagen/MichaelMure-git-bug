import { Folder, File } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import type { GitTreeEntry } from '@/lib/gitApi'

interface FileTreeProps {
  entries: GitTreeEntry[]
  path: string
  loading?: boolean
  onNavigate: (entry: GitTreeEntry) => void
  onNavigateUp: () => void
}

// Directory listing table for the code browser. Shows each entry's icon,
// name, last-commit message (linked to commit detail), and relative date.
export function FileTree({ entries, path, loading, onNavigate, onNavigateUp }: FileTreeProps) {
  // Directories first, then files — each group alphabetical
  const sorted = [...entries].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'tree' ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  if (loading) return <FileTreeSkeleton />

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-border">
          {path && (
            <tr
              className="cursor-pointer hover:bg-muted/40"
              onClick={onNavigateUp}
            >
              <td className="w-6 py-2 pl-4">
                <Folder className="size-4 text-blue-500 dark:text-blue-400" />
              </td>
              <td className="px-3 py-2 font-mono text-muted-foreground">..</td>
              <td className="hidden px-3 py-2 text-muted-foreground md:table-cell" />
              <td className="hidden px-4 py-2 text-right text-muted-foreground md:table-cell" />
            </tr>
          )}
          {sorted.map((entry) => (
            <FileTreeRow key={entry.name} entry={entry} onNavigate={onNavigate} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FileTreeRow({
  entry,
  onNavigate,
}: {
  entry: GitTreeEntry
  onNavigate: (entry: GitTreeEntry) => void
}) {
  const isDir = entry.type === 'tree'

  return (
    <tr
      className="cursor-pointer hover:bg-muted/40"
      onClick={() => onNavigate(entry)}
    >
      <td className="w-6 py-2 pl-4">
        {isDir ? (
          <Folder className="size-4 text-blue-500 dark:text-blue-400" />
        ) : (
          <File className="size-4 text-muted-foreground" />
        )}
      </td>
      <td className="px-3 py-2">
        <span className={`font-mono ${isDir ? 'font-medium text-foreground' : 'text-foreground'}`}>
          {entry.name}
        </span>
      </td>
      <td className="hidden max-w-xs truncate px-3 py-2 text-muted-foreground md:table-cell">
        {entry.lastCommit && (
          <Link
            to={`/commit/${entry.lastCommit.hash}`}
            className="hover:text-foreground hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {entry.lastCommit.message}
          </Link>
        )}
      </td>
      <td className="hidden whitespace-nowrap px-4 py-2 text-right text-xs text-muted-foreground md:table-cell">
        {entry.lastCommit &&
          formatDistanceToNow(new Date(entry.lastCommit.date), { addSuffix: true })}
      </td>
    </tr>
  )
}

function FileTreeSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="divide-y divide-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="ml-6 hidden h-4 w-64 md:block" />
            <Skeleton className="ml-auto hidden h-4 w-20 md:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
