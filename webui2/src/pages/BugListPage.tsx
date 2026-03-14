import { useState, useEffect } from 'react'
import { CircleDot, CircleCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BugRow } from '@/components/bugs/BugRow'
import { IssueFilters } from '@/components/bugs/IssueFilters'
import type { SortValue } from '@/components/bugs/IssueFilters'
import { QueryInput } from '@/components/bugs/QueryInput'
import { useBugListQuery } from '@/__generated__/graphql'
import { cn } from '@/lib/utils'
import { useRepo } from '@/lib/repo'

const PAGE_SIZE = 25

type StatusFilter = 'open' | 'closed'

// Issue list page (/:repo/issues). Search bar with structured query, open/closed toggle,
// label+author filter dropdowns, and paginated bug rows.
export function BugListPage() {
  const repo = useRepo()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open')
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  // humanId — uniquely identifies the selection for the dropdown UI
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null)
  // query value (login/name) — what goes into author:... in the query string
  const [selectedAuthorQuery, setSelectedAuthorQuery] = useState<string | null>(null)
  const [freeText, setFreeText] = useState('')
  const [sort, setSort] = useState<SortValue>('creation-desc')
  const [draft, setDraft] = useState(() => buildQueryString('open', [], null, '', 'creation-desc'))

  // Cursor-stack pagination: cursors[i] is the `after` value to fetch page i.
  // cursors[0] is always undefined (first page needs no cursor).
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined])
  const page = cursors.length - 1  // 0-indexed current page

  // Build separate query strings: two for the always-visible counts (open/closed),
  // one for the paginated list. The count queries share all filters except status.
  const baseQuery = buildBaseQuery(selectedLabels, selectedAuthorQuery, freeText)
  const openQuery = `status:open ${baseQuery}`.trim()
  const closedQuery = `status:closed ${baseQuery}`.trim()
  const listQuery = buildQueryString(statusFilter, selectedLabels, selectedAuthorQuery, freeText, sort)

  const { data, loading, error } = useBugListQuery({
    variables: { ref: repo, openQuery, closedQuery, listQuery, first: PAGE_SIZE, after: cursors[page] },
  })

  const openCount = data?.repository?.openCount.totalCount ?? 0
  const closedCount = data?.repository?.closedCount.totalCount ?? 0
  const bugs = data?.repository?.bugs
  const totalCount = bugs?.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const hasNext = bugs?.pageInfo.hasNextPage ?? false
  const hasPrev = page > 0

  // Reset to page 1 whenever the list query changes.
  useEffect(() => { setCursors([undefined]) }, [listQuery])

  // Apply all filters at once, keeping draft in sync with the structured state.
  function applyFilters(
    status: StatusFilter,
    labels: string[],
    authorId: string | null,
    authorQuery: string | null,
    text: string,
    sortVal: SortValue = sort,
  ) {
    setStatusFilter(status)
    setSelectedLabels(labels)
    setSelectedAuthorId(authorId)
    setSelectedAuthorQuery(authorQuery)
    setFreeText(text)
    setSort(sortVal)
    setDraft(buildQueryString(status, labels, authorQuery, text, sortVal))
  }

  // Parse the draft text box on submit so manual edits update the dropdowns too.
  // When parsing we don't know the humanId — clear it so the dropdown resets.
  // Called both from the <form> onSubmit (with event) and from QueryInput's
  // Enter-key handler (without event), so e is optional.
  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    const p = parseQueryString(draft)
    applyFilters(p.status, p.labels, null, p.author, p.freeText, p.sort)
  }

  function goNext() {
    const endCursor = bugs?.pageInfo.endCursor
    if (!endCursor) return
    setCursors((prev) => [...prev, endCursor])
  }

  function goPrev() {
    setCursors((prev) => prev.slice(0, -1))
  }

  return (
    <div>
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <QueryInput
          value={draft}
          onChange={setDraft}
          onSubmit={handleSearch}
          placeholder="status:open author:… label:…"
        />
        <Button type="submit">
          Search
        </Button>
      </form>

      {/* List container */}
      <div className="rounded-md border border-border">
        {/* Open / Closed toggle + filter dropdowns */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border px-4 py-2">
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => applyFilters('open', selectedLabels, selectedAuthorId, selectedAuthorQuery, freeText)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                statusFilter === 'open'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              <CircleDot className={cn('size-4', statusFilter === 'open' && 'text-green-600 dark:text-green-400')} />
              Open
              <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-xs leading-none tabular-nums">
                {openCount}
              </span>
            </button>

            <button
              onClick={() => applyFilters('closed', selectedLabels, selectedAuthorId, selectedAuthorQuery, freeText)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                statusFilter === 'closed'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              <CircleCheck className={cn('size-4', statusFilter === 'closed' && 'text-purple-600 dark:text-purple-400')} />
              Closed
              <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-xs leading-none tabular-nums">
                {closedCount}
              </span>
            </button>
          </div>

          <div className="ml-auto">
            <IssueFilters
              selectedLabels={selectedLabels}
              onLabelsChange={(labels) => applyFilters(statusFilter, labels, selectedAuthorId, selectedAuthorQuery, freeText)}
              selectedAuthorId={selectedAuthorId}
              onAuthorChange={(id, qv) => applyFilters(statusFilter, selectedLabels, id, qv, freeText)}
              recentAuthorIds={bugs?.nodes?.map((b) => b.author.humanId) ?? []}
              sort={sort}
              onSortChange={(s) => applyFilters(statusFilter, selectedLabels, selectedAuthorId, selectedAuthorQuery, freeText, s)}
            />
          </div>
        </div>

        {/* Bug rows */}
        {error && (
          <p className="px-4 py-8 text-center text-sm text-destructive">
            Failed to load issues: {error.message}
          </p>
        )}

        {loading && !data && <BugListSkeleton />}

        {bugs?.nodes.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No {statusFilter} issues found.
          </p>
        )}

        {bugs?.nodes.map((bug) => (
          <BugRow
            key={bug.id}
            id={bug.id}
            humanId={bug.humanId}
            status={bug.status}
            title={bug.title}
            labels={bug.labels}
            author={bug.author}
            createdAt={bug.createdAt}
            commentCount={bug.comments.totalCount}
            repo={repo}
            onLabelClick={(name) => {
              if (!selectedLabels.includes(name)) {
                applyFilters(statusFilter, [...selectedLabels, name], selectedAuthorId, selectedAuthorQuery, freeText)
              }
            }}
          />
        ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-border px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goPrev}
              disabled={!hasPrev || loading}
              className="gap-1 text-muted-foreground"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={goNext}
              disabled={!hasNext || loading}
              className="gap-1 text-muted-foreground"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// buildBaseQuery returns the filter parts (labels, author, freeText) without
// the status prefix, so it can be combined with "status:open" / "status:closed".
function buildBaseQuery(labels: string[], author: string | null, freeText: string): string {
  const parts: string[] = []
  for (const label of labels) {
    parts.push(label.includes(' ') ? `label:"${label}"` : `label:${label}`)
  }
  if (author) {
    parts.push(author.includes(' ') ? `author:"${author}"` : `author:${author}`)
  }
  if (freeText.trim()) parts.push(freeText.trim())
  return parts.join(' ')
}

// Build the structured query string sent to the GraphQL allBugs(query:) argument.
// Multi-word label/author values are wrapped in quotes so the backend parser
// treats them as a single token (e.g. label:"my label" vs label:my label).
function buildQueryString(
  status: StatusFilter,
  labels: string[],
  author: string | null,
  freeText: string,
  sort: SortValue = 'creation-desc',
): string {
  const parts = [`status:${status}`]
  const base = buildBaseQuery(labels, author, freeText)
  if (base) parts.push(base)
  if (sort !== 'creation-desc') parts.push(`sort:${sort}`)
  return parts.join(' ')
}

// Tokenize a query string, keeping quoted spans (e.g. author:"René Descartes")
// as single tokens. Quotes are preserved in the output so callers can strip them
// when extracting values.
function tokenizeQuery(input: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inQuote = false
  for (const ch of input.trim()) {
    if (ch === '"') { inQuote = !inQuote; current += ch }
    else if (ch === ' ' && !inQuote) { if (current) { tokens.push(current); current = '' } }
    else current += ch
  }
  if (current) tokens.push(current)
  return tokens
}

// Parse a free-text query string back into structured filter state so that
// manual edits to the search box are reflected in the dropdown UI on submit.
// Strips surrounding quotes from values (they're an encoding detail, not part
// of the value itself). Unknown tokens fall through to freeText.
const VALID_SORTS = new Set<SortValue>(['creation-desc', 'creation-asc', 'edit-desc', 'edit-asc'])

function parseQueryString(input: string): {
  status: StatusFilter
  labels: string[]
  author: string | null
  freeText: string
  sort: SortValue
} {
  let status: StatusFilter = 'open'
  const labels: string[] = []
  let author: string | null = null
  let sort: SortValue = 'creation-desc'
  const free: string[] = []

  for (const token of tokenizeQuery(input)) {
    if (token === 'status:open') status = 'open'
    else if (token === 'status:closed') status = 'closed'
    else if (token.startsWith('label:')) labels.push(token.slice(6))
    else if (token.startsWith('author:')) author = token.slice(7).replace(/^"|"$/g, '')
    else if (token.startsWith('sort:')) {
      const v = token.slice(5) as SortValue
      if (VALID_SORTS.has(v)) sort = v
    }
    else free.push(token)
  }

  return { status, labels, author, freeText: free.join(' '), sort }
}

function BugListSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3">
          <Skeleton className="mt-0.5 size-4 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
