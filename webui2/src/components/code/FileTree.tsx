import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Folder, File } from "lucide-react";

import { GitObjectType, type GitTreeEntry } from "@/__generated__/graphql";
import { Skeleton } from "@/components/ui/skeleton";

export interface TreeEntryWithCommit extends GitTreeEntry {
  lastCommit?: {
    hash: string;
    shortHash: string;
    message: string;
    date: string;
  };
}

interface FileTreeProps {
  repo: string | null;
  entries: TreeEntryWithCommit[];
  path: string;
  loading?: boolean;
  onNavigate: (entry: TreeEntryWithCommit) => void;
  onNavigateUp: () => void;
}

// Directory listing table for the code browser. Shows each entry's icon,
// name, last-commit message (linked to commit detail), and relative date.
export function FileTree({
  repo,
  entries,
  path,
  loading,
  onNavigate,
  onNavigateUp,
}: FileTreeProps) {
  // Directories first, then files — each group alphabetical
  const sorted = entries.toSorted((a, b) => {
    if (a.type !== b.type) return a.type === GitObjectType.Tree ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  if (loading) return <FileTreeSkeleton />;

  return (
    <div className="border-border overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <tbody className="divide-border divide-y">
          {path && (
            <tr className="hover:bg-muted/40 cursor-pointer" onClick={onNavigateUp}>
              <td className="w-6 py-2 pl-4">
                <Folder className="size-4 text-blue-500 dark:text-blue-400" />
              </td>
              <td className="text-muted-foreground px-3 py-2 font-mono">..</td>
              <td className="text-muted-foreground hidden px-3 py-2 md:table-cell" />
              <td className="text-muted-foreground hidden px-4 py-2 text-right md:table-cell" />
            </tr>
          )}
          {sorted.map((entry) => (
            <FileTreeRow key={entry.name} entry={entry} repo={repo} onNavigate={onNavigate} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FileTreeRow({
  entry,
  repo,
  onNavigate,
}: {
  entry: TreeEntryWithCommit;
  repo: string | null;
  onNavigate: (entry: TreeEntryWithCommit) => void;
}) {
  const isDir = entry.type === GitObjectType.Tree;

  return (
    <tr className="hover:bg-muted/40 cursor-pointer" onClick={() => onNavigate(entry)}>
      <td className="w-6 py-2 pl-4">
        {isDir ? (
          <Folder className="size-4 text-blue-500 dark:text-blue-400" />
        ) : (
          <File className="text-muted-foreground size-4" />
        )}
      </td>
      <td className="px-3 py-2">
        <span className={`font-mono ${isDir ? "text-foreground font-medium" : "text-foreground"}`}>
          {entry.name}
        </span>
      </td>
      <td className="text-muted-foreground hidden max-w-xs truncate px-3 py-2 md:table-cell">
        {entry.lastCommit && (
          <Link
            to="/$repo/commit/$hash"
            params={{ repo: repo!, hash: entry.lastCommit.hash }}
            className="hover:text-foreground hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {entry.lastCommit.message}
          </Link>
        )}
      </td>
      <td className="text-muted-foreground hidden px-4 py-2 text-right text-xs whitespace-nowrap md:table-cell">
        {entry.lastCommit &&
          formatDistanceToNow(new Date(entry.lastCommit.date), { addSuffix: true })}
      </td>
    </tr>
  );
}

function FileTreeSkeleton() {
  return (
    <div className="border-border overflow-hidden rounded-md border">
      <div className="divide-border divide-y">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2">
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="ml-6 hidden h-4 w-64 md:block" />
            <Skeleton className="ml-auto hidden h-4 w-20 md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
