// Paginated commit history grouped by calendar date. Each row links to the
// commit detail page. Used in CodePage's "History" view.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { GitCommit } from 'lucide-react'
import { gql, useQuery } from '@apollo/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRepo } from '@/lib/repo'

const COMMITS_QUERY = gql`
  query CommitList($repo: String, $ref: String!, $path: String, $after: String, $first: Int) {
    repository(ref: $repo) {
      commits(ref: $ref, path: $path, after: $after, first: $first) {
        nodes {
          hash
          shortHash
          message
          authorName
          date
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`

const PAGE_SIZE = 30

interface CommitListProps {
  ref_: string
  path?: string
}

type CommitNode = {
  hash: string
  shortHash: string
  message: string
  authorName: string
  date: string
}

export function CommitList({ ref_, path }: CommitListProps) {
  const repo = useRepo()
  const [cursor, setCursor] = useState<string | null>(null)
  const [allCommits, setAllCommits] = useState<CommitNode[]>([])

  const { loading, error, fetchMore } = useQuery(COMMITS_QUERY, {
    variables: { repo, ref: ref_, path: path ?? null, after: null, first: PAGE_SIZE },
    skip: !ref_,
    onCompleted(data) {
      const nodes = data?.repository?.commits?.nodes ?? []
      setAllCommits(nodes)
      setCursor(data?.repository?.commits?.pageInfo?.endCursor ?? null)
    },
  })

  const hasMore = !!cursor && allCommits.length > 0 && allCommits.length % PAGE_SIZE === 0
  const [loadingMore, setLoadingMore] = useState(false)

  function loadMore() {
    if (!cursor) return
    setLoadingMore(true)
    fetchMore({
      variables: { after: cursor },
    }).then((result) => {
      const newNodes = result.data?.repository?.commits?.nodes ?? []
      setAllCommits((prev) => [...prev, ...newNodes])
      setCursor(result.data?.repository?.commits?.pageInfo?.endCursor ?? null)
    }).finally(() => setLoadingMore(false))
  }

  if (loading) return <CommitListSkeleton />

  if (error) {
    return (
      <div className="rounded-md border border-border px-4 py-8 text-center text-sm text-destructive">
        {error.message}
      </div>
    )
  }

  const groups = groupByDate(allCommits)

  return (
    <div className="space-y-6">
      {groups.map(([date, group]) => (
        <div key={date}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Commits on {date}
          </h3>
          <div className="overflow-hidden rounded-md border border-border divide-y divide-border">
            {group.map((commit) => (
              <CommitRow key={commit.hash} commit={commit} repo={repo} />
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

function CommitRow({ commit, repo }: { commit: CommitNode; repo: string | null }) {
  const commitPath = repo ? `/${repo}/commit/${commit.hash}` : `/commit/${commit.hash}`
  return (
    <div className="flex items-center gap-3 bg-background px-4 py-3 hover:bg-muted/30">
      <GitCommit className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <Link
          to={commitPath}
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
        to={commitPath}
        className="shrink-0 font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
        title={commit.hash}
      >
        {commit.shortHash}
      </Link>
    </div>
  )
}

function groupByDate(commits: CommitNode[]): [string, CommitNode[]][] {
  const map = new Map<string, CommitNode[]>()
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
