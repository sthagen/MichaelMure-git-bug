import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { gql, useQuery } from '@apollo/client'
import { AlertCircle, GitCommit } from 'lucide-react'
import { CodeBreadcrumb } from '@/components/code/CodeBreadcrumb'
import { RefSelector } from '@/components/code/RefSelector'
import { FileTree } from '@/components/code/FileTree'
import { FileViewer } from '@/components/code/FileViewer'
import { CommitList } from '@/components/code/CommitList'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { getRefs, getTree, getBlob } from '@/lib/gitApi'
import type { GitRef, GitTreeEntry, GitBlob } from '@/lib/gitApi'
import { useRepo } from '@/lib/repo'

const REPO_NAME_QUERY = gql`
  query RepoName($ref: String) {
    repository(ref: $ref) {
      name
    }
  }
`

type ViewMode = 'tree' | 'blob' | 'commits'

// Code browser page (/:repo). Switches between tree view, file viewer, and
// commit history via the ?type= search param. Ref is selected via ?ref=.
export function CodePage() {
  const repo = useRepo()
  const [searchParams, setSearchParams] = useSearchParams()

  const [refs, setRefs] = useState<GitRef[]>([])
  const [refsLoading, setRefsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [entries, setEntries] = useState<GitTreeEntry[]>([])
  const [blob, setBlob] = useState<GitBlob | null>(null)
  const [contentLoading, setContentLoading] = useState(false)

  const currentRef = searchParams.get('ref') ?? ''
  const currentPath = searchParams.get('path') ?? ''
  const viewMode: ViewMode = (searchParams.get('type') as ViewMode) ?? 'tree'

  // Load refs once on mount
  useEffect(() => {
    getRefs()
      .then((data) => {
        setRefs(data)
        // If no ref in URL yet, use the default branch
        if (!searchParams.get('ref')) {
          const defaultRef = data.find((r) => r.isDefault) ?? data[0]
          if (defaultRef) {
            setSearchParams(
              (prev) => { prev.set('ref', defaultRef.shortName); return prev },
              { replace: true },
            )
          }
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setRefsLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load tree or blob when ref/path/mode changes
  useEffect(() => {
    if (!currentRef) return
    setContentLoading(true)
    setEntries([])
    setBlob(null)

    const load =
      viewMode === 'blob'
        ? getBlob(currentRef, currentPath).then((b) => setBlob(b))
        : getTree(currentRef, currentPath).then((e) => setEntries(e))

    load
      .catch((e: Error) => setError(e.message))
      .finally(() => setContentLoading(false))
  }, [currentRef, currentPath, viewMode])

  function navigate(path: string, type: ViewMode = 'tree') {
    setSearchParams((prev) => {
      prev.set('path', path)
      prev.set('type', type)
      return prev
    })
  }

  function handleEntryClick(entry: GitTreeEntry) {
    const newPath = currentPath ? `${currentPath}/${entry.name}` : entry.name
    navigate(newPath, entry.type === 'blob' ? 'blob' : 'tree')
  }

  function handleNavigateUp() {
    const parts = currentPath.split('/').filter(Boolean)
    parts.pop()
    navigate(parts.join('/'), 'tree')
  }

  function handleRefSelect(ref: GitRef) {
    setSearchParams((prev) => {
      prev.set('ref', ref.shortName)
      prev.set('path', '')
      prev.set('type', 'tree')
      return prev
    })
  }

  const { data: repoData } = useQuery(REPO_NAME_QUERY, { variables: { ref: repo } })
  const repoName = repoData?.repository?.name ?? repo ?? 'git-bug'

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">Code browser unavailable</p>
        <p className="max-w-sm text-xs text-muted-foreground">{error}</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Make sure the git-bug server is running and the repository supports code browsing.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top bar: breadcrumb + ref selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {refsLoading ? (
          <Skeleton className="h-5 w-48" />
        ) : (
          <CodeBreadcrumb
            repoName={repoName}
            ref={currentRef}
            path={currentPath}
            onNavigate={(p) => navigate(p, 'tree')}
          />
        )}
        <div className="flex items-center gap-2">
          {!refsLoading && (
            <Button
              variant={viewMode === 'commits' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() =>
                navigate(
                  currentPath,
                  viewMode === 'commits' ? 'tree' : 'commits',
                )
              }
            >
              <GitCommit className="size-3.5" />
              History
            </Button>
          )}
          {refsLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <RefSelector refs={refs} currentRef={currentRef} onSelect={handleRefSelect} />
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'commits' ? (
        <CommitList ref_={currentRef} path={currentPath || undefined} />
      ) : viewMode === 'tree' || !blob ? (
        <FileTree
          entries={entries}
          path={currentPath}
          loading={contentLoading}
          onNavigate={handleEntryClick}
          onNavigateUp={handleNavigateUp}
        />
      ) : (
        <FileViewer blob={blob} loading={contentLoading} />
      )}
    </div>
  )
}
