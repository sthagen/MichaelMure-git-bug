// Repository picker page (/). Shows all registered repos and lets the user
// navigate into one. When there is only one repo, the list still renders
// (no auto-redirect) so the user always knows which repo they're entering.

import { Link } from 'react-router-dom'
import { GitFork, FolderOpen, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useRepositoriesQuery } from '@/__generated__/graphql'

export function RepoPickerPage() {
  const { data, loading, error } = useRepositoriesQuery()

  return (
    <div className="mx-auto max-w-lg py-12">
      <div className="mb-8 flex items-center gap-3">
        <GitFork className="size-6 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Repositories</h1>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          Failed to load repositories: {error.message}
        </div>
      )}

      {loading && !data && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      )}

      <div className="divide-y divide-border rounded-md border border-border">
        {data?.repositories.nodes.map((repo) => (
          <Link
            key={repo.slug}
            to={`/${repo.slug}`}
            className="flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors"
          >
            <FolderOpen className="size-5 shrink-0 text-muted-foreground" />
            <p className="font-medium text-foreground">{repo.slug}</p>
          </Link>
        ))}

        {data?.repositories.totalCount === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No repositories found.
          </p>
        )}
      </div>
    </div>
  )
}
