import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, FilePlus, FileMinus, FileEdit, GitCommit } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { getCommit } from '@/lib/gitApi'
import type { GitCommitDetail } from '@/lib/gitApi'
import { useRepo } from '@/lib/repo'

const statusIcon = {
  added:    <FilePlus className="size-4 text-green-600 dark:text-green-400" />,
  deleted:  <FileMinus className="size-4 text-red-500 dark:text-red-400" />,
  modified: <FileEdit className="size-4 text-yellow-500 dark:text-yellow-400" />,
  renamed:  <FileEdit className="size-4 text-blue-500 dark:text-blue-400" />,
}

const statusLabel = {
  added: 'A', deleted: 'D', modified: 'M', renamed: 'R',
}

// Commit detail page (/:repo/commit/:hash). Shows commit metadata, full message,
// parent links, and the list of files changed with add/modify/delete/rename status.
export function CommitPage() {
  const { hash } = useParams<{ hash: string }>()
  const navigate = useNavigate()
  const repo = useRepo()
  const [commit, setCommit] = useState<GitCommitDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getCommit(hash!)
      .then(setCommit)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [hash])

  if (loading) return <CommitPageSkeleton />

  if (error) {
    return (
      <div className="py-16 text-center text-sm text-destructive">
        Failed to load commit: {error}
      </div>
    )
  }

  if (!commit) return null

  const date = new Date(commit.date)

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back
      </button>

      {/* Header */}
      <div className="mb-6 rounded-md border border-border p-5">
        <div className="mb-1 flex items-start gap-3">
          <GitCommit className="mt-1 size-5 shrink-0 text-muted-foreground" />
          <h1 className="text-lg font-semibold leading-snug">{commit.message}</h1>
        </div>

        {/* Full message body (if multi-line) */}
        {commit.fullMessage.includes('\n') && (
          <pre className="mb-4 ml-8 mt-3 whitespace-pre-wrap font-sans text-sm text-muted-foreground">
            {commit.fullMessage.split('\n').slice(1).join('\n').trim()}
          </pre>
        )}

        <div className="ml-8 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{commit.authorName}</span>
            {commit.authorEmail && (
              <span> &lt;{commit.authorEmail}&gt;</span>
            )}
          </span>
          <span title={date.toISOString()}>{format(date, 'PPP')}</span>
        </div>

        <div className="ml-8 mt-3 flex flex-wrap gap-3 text-xs">
          <span className="text-muted-foreground">
            commit{' '}
            <code className="font-mono text-foreground">{commit.hash}</code>
          </span>
          {commit.parents.map((p) => (
            <span key={p} className="text-muted-foreground">
              parent{' '}
              <Link
                to={repo ? `/${repo}/commit/${p}` : `/commit/${p}`}
                className="font-mono text-foreground hover:underline"
              >
                {p.slice(0, 7)}
              </Link>
            </span>
          ))}
        </div>
      </div>

      {/* Changed files */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {commit.files.length} file{commit.files.length !== 1 ? 's' : ''} changed
        </h2>
        <div className="overflow-hidden rounded-md border border-border divide-y divide-border">
          {commit.files.length === 0 && (
            <p className="px-4 py-4 text-sm text-muted-foreground">No file changes.</p>
          )}
          {commit.files.map((file) => (
            <div key={file.path} className="flex items-center gap-3 px-4 py-2.5">
              <span
                className="w-4 shrink-0 text-center font-mono text-xs font-bold"
                title={file.status}
              >
                {statusIcon[file.status]}
              </span>
              <span className="min-w-0 flex-1 font-mono text-sm">
                {file.status === 'renamed' ? (
                  <>
                    <span className="text-muted-foreground line-through">{file.oldPath}</span>
                    {' → '}
                    <span>{file.path}</span>
                  </>
                ) : (
                  file.path
                )}
              </span>
              <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                {statusLabel[file.status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CommitPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-24" />
      <div className="rounded-md border border-border p-5 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="rounded-md border border-border divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <Skeleton className="size-4" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
