import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { GitCommit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getCommits } from '@/lib/gitApi'
import type { GitCommit as GitCommitType } from '@/lib/gitApi'

interface CommitListProps {
  ref_: string
  path?: string
}

const PAGE_SIZE = 30

// Paginated commit history grouped by calendar date. Each row links to the
// commit detail page. Used in CodePage's "History" view.
export function CommitList({ ref_, path }: CommitListProps) {
  const [commits, setCommits] = useState<GitCommitType[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    setCommits([])
    setHasMore(true)
    setError(null)
    setLoading(true)
    getCommits(ref_, { path, limit: PAGE_SIZE })
      .then((data) => {
        setCommits(data)
        setHasMore(data.length === PAGE_SIZE)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [ref_, path])

  function loadMore() {
    const last = commits[commits.length - 1]
    if (!last) return
    setLoadingMore(true)
    getCommits(ref_, { path, limit: PAGE_SIZE, after: last.hash })
      .then((data) => {
        setCommits((prev) => [...prev, ...data])
        setHasMore(data.length === PAGE_SIZE)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingMore(false))
  }

  if (loading) return <CommitListSkeleton />

  if (error) {
    return (
      <div className="rounded-md border border-border px-4 py-8 text-center text-sm text-destructive">
        {error}
      </div>
    )
  }

  // Group commits by date (YYYY-MM-DD)
  const groups = groupByDate(commits)

  return (
    <div className="space-y-6">
      {groups.map(([date, group]) => (
        <div key={date}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Commits on {date}
          </h3>
          <div className="overflow-hidden rounded-md border border-border divide-y divide-border">
            {group.map((commit) => (
              <CommitRow key={commit.hash} commit={commit} />
            ))}
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load more commits'}
          </Button>
        </div>
      )}
    </div>
  )
}

function CommitRow({ commit }: { commit: GitCommitType }) {
  return (
    <div className="flex items-center gap-3 bg-background px-4 py-3 hover:bg-muted/30">
      <GitCommit className="size-4 shrink-0 text-muted-foreground" />

      <div className="min-w-0 flex-1">
        <Link
          to={`/commit/${commit.hash}`}
          className="block truncate font-medium text-foreground hover:text-primary hover:underline"
        >
          {commit.message}
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {commit.authorName} &middot;{' '}
          {formatDistanceToNow(new Date(commit.date), { addSuffix: true })}
        </p>
      </div>

      <Link
        to={`/commit/${commit.hash}`}
        className="shrink-0 font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
        title={commit.hash}
      >
        {commit.shortHash}
      </Link>
    </div>
  )
}

function groupByDate(commits: GitCommitType[]): [string, GitCommitType[]][] {
  const map = new Map<string, GitCommitType[]>()
  for (const c of commits) {
    const date = new Date(c.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const group = map.get(date) ?? []
    group.push(c)
    map.set(date, group)
  }
  return Array.from(map.entries())
}

function CommitListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, g) => (
        <div key={g}>
          <Skeleton className="mb-2 h-3 w-32" />
          <div className="overflow-hidden rounded-md border border-border divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="size-4 rounded" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
