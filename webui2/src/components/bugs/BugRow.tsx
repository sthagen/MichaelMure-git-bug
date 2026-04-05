import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, CircleDot, CircleCheck } from "lucide-react";

import { Status } from "@/__generated__/graphql";

import { LabelBadge } from "./LabelBadge";

interface BugRowProps {
  id: string;
  humanId: string;
  status: Status;
  title: string;
  labels: Array<{ name: string; color: { R: number; G: number; B: number } }>;
  author: { humanId: string; displayName: string; avatarUrl?: string | null };
  createdAt: string;
  commentCount: number;
  repo: string;
}

// Single row in the issue list. Shows status icon, title, labels, author and
// comment count.
/** @deprecated Use IssueRow composition components instead. */
export function BugRow({
  humanId,
  status,
  title,
  labels,
  author,
  createdAt,
  commentCount,
  repo,
}: BugRowProps) {
  const isOpen = status === Status.Open;
  const StatusIcon = isOpen ? CircleDot : CircleCheck;

  return (
    <div className="border-border hover:bg-muted/30 flex items-start gap-3 border-b px-4 py-3 last:border-0">
      <StatusIcon
        className={
          isOpen
            ? "mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400"
            : "mt-0.5 size-4 shrink-0 text-purple-600 dark:text-purple-400"
        }
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <Link
            to="/$repo/issues/$id"
            params={{ repo, id: humanId }}
            className="text-foreground hover:text-primary font-medium hover:underline"
          >
            {title}
          </Link>
          {labels.map((label) => (
            <LabelBadge
              key={label.name}
              name={label.name}
              color={label.color}
            />
          ))}
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          #{humanId} opened {formatDistanceToNow(new Date(createdAt), { addSuffix: true })} by{" "}
          <Link
            to="/$repo/user/$id"
            params={{ repo, id: author.humanId }}
            search={{ status: "open" as const, after: "" }}
            className="hover:underline"
          >
            {author.displayName}
          </Link>
        </p>
      </div>

      {commentCount > 0 && (
        <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
          <MessageSquare className="size-3.5" />
          {commentCount}
        </div>
      )}
    </div>
  );
}
