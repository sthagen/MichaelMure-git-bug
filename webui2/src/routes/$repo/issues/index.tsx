import { useReadQuery } from "@apollo/client/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CircleDot, CircleCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import * as v from "valibot";

import {
  type BugListQuery,
  BugListDocument,
  type ValidLabelsQuery,
  ValidLabelsDocument,
  type AllIdentitiesQuery,
  AllIdentitiesDocument,
} from "@/__generated__/graphql";
import { BugRow } from "@/components/bugs/BugRow";
import { IssueFilters } from "@/components/bugs/IssueFilters";
import type { SortValue } from "@/components/bugs/IssueFilters";
import { QueryInput } from "@/components/bugs/QueryInput";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import { preloadQuery } from "@/lib/apollo";
import { useRepo } from "@/lib/repo";
import { cn } from "@/lib/utils";

const issuesSearchSchema = v.object({
  q: v.fallback(v.string(), "status:open"),
  after: v.fallback(v.string(), ""),
});

export const Route = createFileRoute("/$repo/issues/")({
  component: RouteComponent,
  pendingComponent: BugListSkeleton,
  validateSearch: (search) => v.parse(issuesSearchSchema, search),
  loaderDeps: ({ search: { q, after } }) => ({ q, after }),
  loader: ({ params: { repo }, deps: { q, after } }) => {
    const ref = repo === "_" ? null : repo;
    const parsed = parseQueryString(q);
    const baseQuery = buildBaseQuery(parsed.labels, parsed.author, parsed.freeText);
    return {
      bugListRef: preloadQuery<BugListQuery>(BugListDocument, {
        variables: {
          ref,
          openQuery: `status:open ${baseQuery}`.trim(),
          closedQuery: `status:closed ${baseQuery}`.trim(),
          listQuery: q,
          first: PAGE_SIZE,
          after: after || undefined,
        },
      }),
      labelsRef: preloadQuery<ValidLabelsQuery>(ValidLabelsDocument, {
        variables: { ref },
      }),
      identitiesRef: preloadQuery<AllIdentitiesQuery>(AllIdentitiesDocument, {
        variables: { ref },
      }),
    };
  },
});

const PAGE_SIZE = 25;

type StatusFilter = "open" | "closed";

function RouteComponent() {
  const repo = useRepo();
  const navigate = useNavigate({ from: "/$repo/issues/" });
  const { q, after } = Route.useSearch();

  // Parse the URL query into structured filter state for the dropdowns
  const parsed = parseQueryString(q);
  const {
    status: statusFilter,
    labels: selectedLabels,
    author: selectedAuthorQuery,
    sort,
  } = parsed;
  // We don't have the humanId from URL — the dropdown will match by query value
  const selectedAuthorId: string | null = null;

  // Draft is the text input value — starts from URL, only committed on submit
  const [draft, setDraft] = useState(q);

  const { bugListRef, labelsRef, identitiesRef } = Route.useLoaderData();
  const { data } = useReadQuery(bugListRef);
  const { data: labelsData } = useReadQuery(labelsRef);
  const { data: identitiesData } = useReadQuery(identitiesRef);

  const openCount = data?.repository?.openCount.totalCount ?? 0;
  const closedCount = data?.repository?.closedCount.totalCount ?? 0;
  const bugs = data?.repository?.bugs;
  const validLabels = labelsData?.repository?.validLabels.nodes ?? [];
  const allIdentities = identitiesData?.repository?.allIdentities.nodes ?? [];
  const totalCount = bugs?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasNext = bugs?.pageInfo.hasNextPage ?? false;
  const hasPrev = !!after;

  // Navigate to new search params (resets pagination)
  function setSearch(newQ: string) {
    setDraft(newQ);
    void navigate({ search: { q: newQ, after: "" } });
  }

  // Apply structured filters → build query string → navigate
  function applyFilters(
    status: StatusFilter,
    labels: string[],
    authorQuery: string | null,
    text: string,
    sortVal: SortValue = sort,
  ) {
    setSearch(buildQueryString(status, labels, authorQuery, text, sortVal));
  }

  // Parse the draft text box on submit
  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setSearch(draft);
  }

  // Build query string with toggled status
  function queryWithStatus(status: StatusFilter): string {
    return buildQueryString(status, selectedLabels, selectedAuthorQuery, parsed.freeText, sort);
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
          labels={validLabels}
          identities={allIdentities}
        />
        <Button type="submit">Search</Button>
      </form>

      {/* List container */}
      <div className="border-border rounded-md border">
        {/* Open / Closed toggle + filter dropdowns */}
        <div className="border-border flex items-center gap-2 overflow-x-auto border-b px-4 py-2">
          <div className="flex shrink-0 items-center gap-1">
            <Link
              to="/$repo/issues"
              params={{ repo: repo! }}
              search={{ q: queryWithStatus("open"), after: "" }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                statusFilter === "open"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <CircleDot
                className={cn(
                  "size-4",
                  statusFilter === "open" && "text-green-600 dark:text-green-400",
                )}
              />
              Open
              <span className="bg-muted ml-0.5 rounded-full px-1.5 py-0.5 text-xs leading-none tabular-nums">
                {openCount}
              </span>
            </Link>

            <Link
              to="/$repo/issues"
              params={{ repo: repo! }}
              search={{ q: queryWithStatus("closed"), after: "" }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                statusFilter === "closed"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <CircleCheck
                className={cn(
                  "size-4",
                  statusFilter === "closed" && "text-purple-600 dark:text-purple-400",
                )}
              />
              Closed
              <span className="bg-muted ml-0.5 rounded-full px-1.5 py-0.5 text-xs leading-none tabular-nums">
                {closedCount}
              </span>
            </Link>
          </div>

          <div className="ml-auto">
            <IssueFilters
              labels={validLabels}
              identities={allIdentities}
              selectedLabels={selectedLabels}
              onLabelsChange={(labels) =>
                applyFilters(statusFilter, labels, selectedAuthorQuery, parsed.freeText)
              }
              selectedAuthorId={selectedAuthorId}
              onAuthorChange={(_id, qv) =>
                applyFilters(statusFilter, selectedLabels, qv, parsed.freeText)
              }
              recentAuthorIds={bugs?.nodes?.map((b) => b.author.humanId) ?? []}
              sort={sort}
              onSortChange={(s) =>
                applyFilters(statusFilter, selectedLabels, selectedAuthorQuery, parsed.freeText, s)
              }
            />
          </div>
        </div>

        {/* Bug rows */}
        {bugs?.nodes.length === 0 && (
          <p className="text-muted-foreground px-4 py-8 text-center text-sm">
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
                applyFilters(
                  statusFilter,
                  [...selectedLabels, name],
                  selectedAuthorQuery,
                  parsed.freeText,
                );
              }
            }}
          />
        ))}

        {totalPages > 1 && (
          <div className="border-border flex items-center justify-center gap-2 border-t px-4 py-2">
            <ButtonLink
              to="/$repo/issues"
              params={{ repo: repo! }}
              search={{ q, after: "" }}
              variant="ghost"
              size="sm"
              disabled={!hasPrev}
              className="text-muted-foreground gap-1"
            >
              <ChevronLeft className="size-4" />
              Previous
            </ButtonLink>
            <span className="text-muted-foreground text-sm">
              Page {after ? 2 : 1} of {totalPages}
            </span>
            <ButtonLink
              to="/$repo/issues"
              params={{ repo: repo! }}
              search={{ q, after: bugs?.pageInfo.endCursor ?? "" }}
              variant="ghost"
              size="sm"
              disabled={!hasNext}
              className="text-muted-foreground gap-1"
            >
              Next
              <ChevronRight className="size-4" />
            </ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
}

// buildBaseQuery returns the filter parts (labels, author, freeText) without
// the status prefix, so it can be combined with "status:open" / "status:closed".
function buildBaseQuery(labels: string[], author: string | null, freeText: string): string {
  const parts: string[] = [];
  for (const label of labels) {
    parts.push(label.includes(" ") ? `label:"${label}"` : `label:${label}`);
  }
  if (author) {
    parts.push(author.includes(" ") ? `author:"${author}"` : `author:${author}`);
  }
  if (freeText.trim()) parts.push(freeText.trim());
  return parts.join(" ");
}

// Build the structured query string sent to the GraphQL allBugs(query:) argument.
function buildQueryString(
  status: StatusFilter,
  labels: string[],
  author: string | null,
  freeText: string,
  sort: SortValue = "creation-desc",
): string {
  const parts = [`status:${status}`];
  const base = buildBaseQuery(labels, author, freeText);
  if (base) parts.push(base);
  if (sort !== "creation-desc") parts.push(`sort:${sort}`);
  return parts.join(" ");
}

// Tokenize a query string, keeping quoted spans as single tokens.
function tokenizeQuery(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inQuote = false;
  for (const ch of input.trim()) {
    if (ch === '"') {
      inQuote = !inQuote;
      current += ch;
    } else if (ch === " " && !inQuote) {
      if (current) {
        tokens.push(current);
        current = "";
      }
    } else current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

// Parse a query string back into structured filter state.
const VALID_SORTS = new Set<string>(["creation-desc", "creation-asc", "edit-desc", "edit-asc"]);

function isValidSort(val: string): val is SortValue {
  return VALID_SORTS.has(val);
}

function parseQueryString(input: string): {
  status: StatusFilter;
  labels: string[];
  author: string | null;
  freeText: string;
  sort: SortValue;
} {
  let status: StatusFilter = "open";
  const labels: string[] = [];
  let author: string | null = null;
  let sort: SortValue = "creation-desc";
  const free: string[] = [];

  for (const token of tokenizeQuery(input)) {
    if (token === "status:open") status = "open";
    else if (token === "status:closed") status = "closed";
    else if (token.startsWith("label:")) labels.push(token.slice(6));
    else if (token.startsWith("author:")) author = token.slice(7).replace(/^"|"$/g, "");
    else if (token.startsWith("sort:")) {
      const val = token.slice(5);
      if (isValidSort(val)) sort = val;
    } else free.push(token);
  }

  return { status, labels, author, freeText: free.join(" "), sort };
}

function BugListSkeleton() {
  return (
    <div className="divide-border divide-y">
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
  );
}
