// User profile page (/user/:id). Fetches an identity by prefix and shows:
//   - avatar, display name, login, email, humanId, protected badge
//   - open/closed issue toggle with BOTH counts always visible
//   - paginated list of that user's bugs (cursor-stack, same approach as BugListPage)
//
// The :id param is treated as a humanId prefix and passed directly to the
// identity(prefix) and allBugs(query:"author:...") GraphQL arguments.

import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  CircleDot,
  CircleCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

import { Status, useUserProfileQuery } from "@/__generated__/graphql";
import { LabelBadge } from "@/components/bugs/LabelBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$repo/_issues/user/$id")({
  component: RouteComponent,
});

const PAGE_SIZE = 25;

function RouteComponent() {
  const { id, repo } = Route.useParams();
  const { ref } = Route.useRouteContext();
  const [statusFilter, setStatusFilter] = useState<"open" | "closed">("open");

  // Cursor-stack pagination: cursors[i] is the `after` value to fetch page i.
  // Resetting to [undefined] returns to page 1. Shared pattern with BugListPage.
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);
  const page = cursors.length - 1;

  // Three allBugs aliases in one round-trip:
  //   openCount / closedCount — always fetched so both badge numbers are visible
  //   bugs — paginated list for the selected tab
  const { data, loading, error } = useUserProfileQuery({
    variables: {
      ref,
      prefix: id,
      openQuery: `author:${id} status:open`,
      closedQuery: `author:${id} status:closed`,
      listQuery: `author:${id} status:${statusFilter}`,
      after: cursors[page],
    },
  });

  function switchStatus(next: "open" | "closed") {
    if (next === statusFilter) return;
    setStatusFilter(next);
    setCursors([undefined]); // reset to page 1 on tab change
  }

  if (error) {
    return (
      <div className="text-destructive py-16 text-center text-sm">
        Failed to load profile: {error.message}
      </div>
    );
  }

  if (loading && !data) return <ProfileSkeleton />;

  const identity = data?.repository?.identity;
  if (!identity) {
    return <div className="text-muted-foreground py-16 text-center text-sm">User not found.</div>;
  }

  const openCount = data?.repository?.openCount.totalCount ?? 0;
  const closedCount = data?.repository?.closedCount.totalCount ?? 0;

  const bugs = data?.repository?.bugs;
  const totalPages = Math.max(1, Math.ceil((bugs?.totalCount ?? 0) / PAGE_SIZE));
  const hasNext = bugs?.pageInfo.hasNextPage ?? false;
  const hasPrev = page > 0;

  function goNext() {
    const cursor = bugs?.pageInfo.endCursor;
    if (cursor) setCursors((prev) => [...prev, cursor]);
  }

  function goPrev() {
    setCursors((prev) => prev.slice(0, -1));
  }

  return (
    <div>
      <BackLink to="/$repo/issues" params={{ repo }} search={{ q: "status:open", after: "" }}>
        Back to issues
      </BackLink>

      {/* ── Profile header ─────────────────────────────────────────────── */}
      <div className="mb-8 flex items-start gap-5">
        <Avatar className="size-20">
          <AvatarImage src={identity.avatarUrl ?? undefined} alt={identity.displayName} />
          <AvatarFallback className="text-2xl">
            {identity.displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="pt-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{identity.displayName}</h1>
            {/* isProtected means this identity has been cryptographically signed */}
            {identity.isProtected && (
              <span title="Protected identity">
                <ShieldCheck className="text-muted-foreground size-4" />
              </span>
            )}
          </div>
          <div className="text-muted-foreground mt-1 space-y-0.5 text-sm">
            {identity.login && <p>@{identity.login}</p>}
            {identity.email && <p>{identity.email}</p>}
            <p className="font-mono text-xs">#{identity.humanId}</p>
          </div>

          {/* Aggregate stats — always visible, independent of selected tab */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <CircleDot className="size-3.5 text-green-600 dark:text-green-400" />
              <span className="text-foreground font-medium">{openCount}</span> open
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
              <CircleCheck className="size-3.5 text-purple-600 dark:text-purple-400" />
              <span className="text-foreground font-medium">{closedCount}</span> closed
            </span>
          </div>
        </div>
      </div>

      {/* ── Issue list ─────────────────────────────────────────────────── */}
      <div className="border-border rounded-md border">
        {/* Open / Closed toggle — mirrors BugListPage style */}
        <div className="border-border flex items-center gap-1 border-b px-4 py-2">
          <button
            onClick={() => switchStatus("open")}
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
            <span className="bg-muted ml-0.5 rounded-full px-1.5 py-0.5 text-xs leading-none">
              {openCount}
            </span>
          </button>

          <button
            onClick={() => switchStatus("closed")}
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
            <span className="bg-muted ml-0.5 rounded-full px-1.5 py-0.5 text-xs leading-none">
              {closedCount}
            </span>
          </button>
        </div>

        {bugs?.nodes.length === 0 && (
          <p className="text-muted-foreground px-4 py-8 text-center text-sm">
            No {statusFilter} issues.
          </p>
        )}

        {bugs?.nodes.map((bug) => {
          const isOpen = bug.status === Status.Open;
          const StatusIcon = isOpen ? CircleDot : CircleCheck;
          return (
            <div
              key={bug.id}
              className="border-border flex items-start gap-3 border-b px-4 py-3 last:border-0"
            >
              <StatusIcon
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  isOpen
                    ? "text-green-600 dark:text-green-400"
                    : "text-purple-600 dark:text-purple-400",
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <Link
                    to="/$repo/issues/$id"
                    params={{ repo: repo, id: bug.humanId }}
                    className="text-foreground hover:text-primary font-medium hover:underline"
                  >
                    {bug.title}
                  </Link>
                  {bug.labels.map((label) => (
                    <LabelBadge key={label.name} name={label.name} color={label.color} />
                  ))}
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  #{bug.humanId} opened{" "}
                  {formatDistanceToNow(new Date(bug.createdAt), { addSuffix: true })}
                </p>
              </div>
              {bug.comments.totalCount > 0 && (
                <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
                  <MessageSquare className="size-3.5" />
                  {bug.comments.totalCount}
                </div>
              )}
            </div>
          );
        })}

        {/* Pagination footer — only shown when there is more than one page */}
        {totalPages > 1 && (
          <div className="border-border flex items-center justify-center gap-2 border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goPrev}
              disabled={!hasPrev || loading}
              className="text-muted-foreground gap-1"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="text-muted-foreground text-sm">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={goNext}
              disabled={!hasNext || loading}
              className="text-muted-foreground gap-1"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-5">
        <Skeleton className="size-20 rounded-full" />
        <div className="space-y-2 pt-1">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
