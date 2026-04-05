import { useReadQuery } from "@apollo/client/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { CircleDot, CircleCheck, Search } from "lucide-react";
import { useMemo, useState } from "react";
import * as v from "valibot";

import { type BugListQuery, BugListDocument } from "@/__generated__/graphql";
import { IssueFilters } from "@/components/bugs/issue-filters";
import * as IssueRow from "@/components/shared/issue-row";
import { LabelBadgeLink } from "@/components/shared/label-badge";
import { EmptyState } from "@/components/shared/empty-state";
import * as Pagination from "@/components/shared/pagination";
import * as QueryInput from "@/components/shared/query-input";
import type { CompletionProvider } from "@/components/shared/query-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SortValue, StatusFilter } from "@/lib/query-utils";
import { buildBaseQuery, buildQueryString, parseQueryString } from "@/lib/query-utils";
import { cn } from "@/lib/utils";

const issuesSearchSchema = v.object({
  q: v.fallback(v.string(), "status:open"),
  after: v.fallback(v.string(), ""),
});

export const Route = createFileRoute("/$repo/_issues/issues/")({
  component: RouteComponent,
  pendingComponent: BugListSkeleton,
  validateSearch: (search) => v.parse(issuesSearchSchema, search),
  loaderDeps: ({ search: { q, after } }) => ({ q, after }),
  loader: async ({ context: { preloadQuery, ref }, deps: { q, after } }) => {
    const parsed = parseQueryString(q);
    const baseQuery = buildBaseQuery(parsed.labels, parsed.author, parsed.freeText);
    const bugListRef = preloadQuery<BugListQuery>(BugListDocument, {
      variables: {
        ref,
        openQuery: `status:open ${baseQuery}`.trim(),
        closedQuery: `status:closed ${baseQuery}`.trim(),
        listQuery: q,
        first: PAGE_SIZE,
        after: after || undefined,
      },
    });
    return { bugListRef: await preloadQuery.toPromise(bugListRef) };
  },
});

const PAGE_SIZE = 25;

function RouteComponent() {
  const { repo } = Route.useParams();
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

  const { bugListRef } = Route.useLoaderData();
  const { labelsRef, identitiesRef } = Route.useRouteContext();
  const { data } = useReadQuery(bugListRef);
  const { data: labelsData } = useReadQuery(labelsRef);
  const { data: identitiesData } = useReadQuery(identitiesRef);

  const openCount = data?.repository?.openCount.totalCount ?? 0;
  const closedCount = data?.repository?.closedCount.totalCount ?? 0;
  const bugs = data?.repository?.bugs;
  const validLabels = labelsData?.repository?.validLabels.nodes;
  const allIdentities = identitiesData?.repository?.allIdentities.nodes;

  const completionProviders: CompletionProvider[] = useMemo(
    () => [
      {
        prefix: "label:",
        highlightClass: "text-yellow-600 dark:text-yellow-500",
        getSuggestions: (query: string) =>
          (validLabels ?? [])
            .filter((l) => query === "" || l.name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 8)
            .map((l) => ({
              value: l.name.includes(" ") ? `"${l.name}"` : l.name,
              label: l.name,
              icon: (
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: `rgb(${l.color.R},${l.color.G},${l.color.B})`,
                  }}
                />
              ),
            })),
      },
      {
        prefix: "author:",
        highlightClass: "text-blue-600 dark:text-blue-400",
        getSuggestions: (query: string) =>
          (allIdentities ?? [])
            .filter(
              (a) =>
                query === "" ||
                a.displayName.toLowerCase().includes(query.toLowerCase()) ||
                (a.login ?? "").toLowerCase().includes(query.toLowerCase()) ||
                (a.name ?? "").toLowerCase().includes(query.toLowerCase()),
            )
            .slice(0, 8)
            .map((a) => {
              const qv = a.login || a.name || a.humanId;
              return {
                value: qv.includes(" ") ? `"${qv}"` : qv,
                label: a.displayName,
                description:
                  a.login && a.login !== a.displayName ? `@${a.login}` : undefined,
              };
            }),
      },
    ],
    [validLabels, allIdentities],
  );

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
        <QueryInput.Root
          value={draft}
          onChange={setDraft}
          onSubmit={handleSearch}
          providers={completionProviders}
        >
          <QueryInput.Icon><Search /></QueryInput.Icon>
          <QueryInput.Input placeholder="status:open author:… label:…" />
          <QueryInput.Completions />
        </QueryInput.Root>
        <Button type="submit">Search</Button>
      </form>

      {/* List container */}
      <div className="border-border rounded-md border">
        {/* Open / Closed toggle + filter dropdowns */}
        <div className="border-border flex items-center gap-2 overflow-x-auto border-b px-4 py-2">
          <div className="flex shrink-0 items-center gap-1">
            <Link
              to="/$repo/issues"
              params={{ repo: repo }}
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
              params={{ repo: repo }}
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
              labels={validLabels ?? []}
              identities={allIdentities ?? []}
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
          <EmptyState>No {statusFilter} issues found.</EmptyState>
        )}

        {bugs?.nodes.map((bug) => (
          <IssueRow.Root key={bug.id} className="hover:bg-muted/30">
            <IssueRow.StatusIcon status={bug.status} />
            <div className="min-w-0 flex-1">
              <IssueRow.TitleArea>
                <Link
                  to="/$repo/issues/$id"
                  params={{ repo, id: bug.humanId }}
                  className="text-foreground hover:text-primary font-medium hover:underline"
                >
                  {bug.title}
                </Link>
                {bug.labels.map((label) => (
                  <LabelBadgeLink
                    key={label.name}
                    name={label.name}
                    color={label.color}
                    to="/$repo/issues"
                    params={{ repo }}
                    search={{
                      q: buildQueryString(
                        statusFilter,
                        selectedLabels.includes(label.name)
                          ? selectedLabels
                          : [...selectedLabels, label.name],
                        selectedAuthorQuery,
                        parsed.freeText,
                        sort,
                      ),
                      after: "",
                    }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  />
                ))}
              </IssueRow.TitleArea>
              <IssueRow.Meta>
                #{bug.humanId} opened{" "}
                {formatDistanceToNow(new Date(bug.createdAt), { addSuffix: true })} by{" "}
                <Link
                  to="/$repo/user/$id"
                  params={{ repo, id: bug.author.humanId }}
                  search={{ status: "open" as const, after: "" }}
                  className="hover:underline"
                >
                  {bug.author.displayName}
                </Link>
              </IssueRow.Meta>
            </div>
            <IssueRow.CommentCount count={bug.comments.totalCount} />
          </IssueRow.Root>
        ))}

        {totalPages > 1 && (
          <Pagination.Root>
            <Pagination.Previous
              to="/$repo/issues"
              params={{ repo }}
              search={{ q, after: "" }}
              disabled={!hasPrev}
            />
            <Pagination.Info>Page {after ? 2 : 1} of {totalPages}</Pagination.Info>
            <Pagination.Next
              to="/$repo/issues"
              params={{ repo }}
              search={{ q, after: bugs?.pageInfo.endCursor ?? "" }}
              disabled={!hasNext}
            />
          </Pagination.Root>
        )}
      </div>
    </div>
  );
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
