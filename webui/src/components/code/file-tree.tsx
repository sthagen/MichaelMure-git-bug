import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Folder, File } from "lucide-react";

/** A single tree entry with optional last-commit metadata, merged from two queries. */
export interface TreeEntryWithCommit {
  name: string;
  type: "BLOB" | "TREE" | "SYMLINK" | "SUBMODULE";
  hash: string;
  lastCommit?: {
    hash: string;
    shortHash: string;
    message: string;
    date: string;
  };
}

interface FileTreeProps {
  repo: string;
  currentRef: string;
  currentPath: string;
  entries: TreeEntryWithCommit[];
}

// Directory listing table for the code browser. Shows each entry's icon,
// name, last-commit message (linked to commit detail), and relative date.
export function FileTree({ repo, currentRef, currentPath, entries }: FileTreeProps) {
  // Directories first, then files — each group alphabetical
  const sorted = entries.toSorted((a, b) => {
    if (a.type !== b.type) return a.type === "TREE" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="border-border overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <tbody className="divide-border divide-y">
          {currentPath && (
            <tr className="hover:bg-muted/40">
              <td colSpan={4}>
                <Link
                  to="/$repo/tree/$ref/$"
                  params={{
                    repo,
                    ref: currentRef,
                    _splat: currentPath.split("/").slice(0, -1).join("/"),
                  }}
                  className="flex items-center gap-3 py-2 pl-4"
                >
                  <Folder className="size-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-muted-foreground font-mono">..</span>
                </Link>
              </td>
            </tr>
          )}
          {sorted.map((entry) => (
            <FileTreeRow
              key={entry.name}
              entry={entry}
              repo={repo}
              currentRef={currentRef}
              currentPath={currentPath}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FileTreeRow({
  entry,
  repo,
  currentRef,
  currentPath,
}: {
  entry: TreeEntryWithCommit;
  repo: string;
  currentRef: string;
  currentPath: string;
}) {
  const isDir = entry.type === "TREE";
  const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;

  const entryLink = isDir
    ? { to: "/$repo/tree/$ref/$" as const, params: { repo, ref: currentRef, _splat: entryPath } }
    : { to: "/$repo/blob/$ref/$" as const, params: { repo, ref: currentRef, _splat: entryPath } };

  return (
    <tr className="hover:bg-muted/40">
      <td className="w-6 py-2 pl-4">
        {isDir ? (
          <Folder className="size-4 text-blue-500 dark:text-blue-400" />
        ) : (
          <File className="text-muted-foreground size-4" />
        )}
      </td>
      <td className="px-3 py-2">
        <Link {...entryLink} className={`font-mono ${isDir ? "font-medium" : ""} hover:underline`}>
          {entry.name}
        </Link>
      </td>
      <td className="text-muted-foreground hidden max-w-xs truncate px-3 py-2 md:table-cell">
        {entry.lastCommit && (
          <Link
            to="/$repo/commit/$hash"
            params={{ repo, hash: entry.lastCommit.hash }}
            className="hover:text-foreground hover:underline"
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
