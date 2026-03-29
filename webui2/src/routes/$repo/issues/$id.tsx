import { useReadQuery } from "@apollo/client/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";

import {
  type BugDetailQuery,
  BugDetailDocument,
  type ValidLabelsQuery,
  ValidLabelsDocument,
} from "@/__generated__/graphql";
import { CommentBox } from "@/components/bugs/CommentBox";
import { LabelEditor } from "@/components/bugs/LabelEditor";
import { StatusBadge } from "@/components/bugs/StatusBadge";
import { Timeline } from "@/components/bugs/Timeline";
import { TitleEditor } from "@/components/bugs/TitleEditor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { preloadQuery } from "@/lib/apollo";
import { useRepo } from "@/lib/repo";

export const Route = createFileRoute("/$repo/issues/$id")({
  component: RouteComponent,
  pendingComponent: BugDetailSkeleton,
  loader: ({ params: { repo, id } }) => ({
    bugDetailRef: preloadQuery<BugDetailQuery>(BugDetailDocument, {
      variables: { ref: repo === "_" ? null : repo, prefix: id },
    }),
    labelsRef: preloadQuery<ValidLabelsQuery>(ValidLabelsDocument, {
      variables: { ref: repo === "_" ? null : repo },
    }),
  }),
});

// Issue detail page (/:repo/issues/:id). Shows title, status, timeline of
// comments and events, and a sidebar with labels and participants.
function RouteComponent() {
  const repo = useRepo();
  const { bugDetailRef, labelsRef } = Route.useLoaderData();
  const { data } = useReadQuery(bugDetailRef);
  const { data: labelsData } = useReadQuery(labelsRef);
  const validLabels = labelsData?.repository?.validLabels.nodes ?? [];

  const bug = data?.repository?.bug;
  if (!bug) {
    return <div className="text-muted-foreground py-16 text-center text-sm">Issue not found.</div>;
  }

  return (
    <div>
      <Link
        to="/$repo/issues"
        params={{ repo: repo! }}
        search={{ q: "status:open", after: "" }}
        className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-3.5" />
        Back to issues
      </Link>

      {/* Title row — hover reveals edit button when logged in */}
      <div className="mb-3">
        <TitleEditor bugPrefix={bug.humanId} title={bug.title} humanId={bug.humanId} ref_={repo} />
      </div>

      <div className="text-muted-foreground mb-6 flex flex-wrap items-center gap-3 text-sm">
        <StatusBadge status={bug.status} />
        <span>
          <Link
            to="/$repo/user/$id"
            params={{ repo: repo!, id: bug.author.humanId }}
            className="text-foreground font-medium hover:underline"
          >
            {bug.author.displayName}
          </Link>{" "}
          opened this issue {formatDistanceToNow(new Date(bug.createdAt), { addSuffix: true })}
        </span>
      </div>

      <Separator className="mb-6" />

      <div className="flex gap-8">
        {/* Timeline + comment box */}
        <div className="min-w-0 flex-1 space-y-4">
          <Timeline bugPrefix={bug.humanId} items={bug.timeline.nodes} />
          <CommentBox bugPrefix={bug.humanId} bugStatus={bug.status} ref_={repo} />
        </div>

        {/* Sidebar */}
        <aside className="w-56 shrink-0 space-y-6">
          <LabelEditor
            bugPrefix={bug.humanId}
            currentLabels={bug.labels}
            ref_={repo}
            validLabels={validLabels}
          />

          <Separator />

          <div>
            <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
              Participants
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {bug.participants.nodes.map((p) => {
                return (
                  <Link
                    key={p.id}
                    to="/$repo/user/$id"
                    params={{ repo: repo!, id: p.humanId }}
                    title={p.displayName}
                  >
                    <Avatar className="size-6">
                      <AvatarImage src={p.avatarUrl ?? undefined} alt={p.displayName} />
                      <AvatarFallback className="text-[10px]">
                        {p.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function BugDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Separator />
      <div className="flex gap-8">
        <div className="flex-1 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-border rounded-md border p-4">
              <Skeleton className="mb-3 h-4 w-1/4" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
        <div className="w-56 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
