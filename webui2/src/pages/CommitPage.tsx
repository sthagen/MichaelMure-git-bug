// Commit detail page (/:repo/commit/:hash). Shows commit metadata, full
// message, parent links, and changed files with lazy diffs.

import { gql, useQuery } from "@apollo/client";
import { format } from "date-fns";
import { ArrowLeft, GitCommit } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";

import { FileDiffView } from "@/components/code/FileDiffView";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepo } from "@/lib/repo";

const COMMIT_QUERY = gql`
  query CommitPageDetail($repo: String, $hash: String!) {
    repository(ref: $repo) {
      commit(hash: $hash) {
        hash
        shortHash
        message
        fullMessage
        authorName
        authorEmail
        date
        parents
        files {
          nodes {
            path
            oldPath
            status
          }
        }
      }
    }
  }
`;

export function CommitPage() {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  const repo = useRepo();

  const { data, loading, error } = useQuery(COMMIT_QUERY, {
    variables: { repo, hash },
    skip: !hash,
  });

  if (loading) return <CommitPageSkeleton />;

  if (error) {
    return (
      <div className="py-16 text-center text-sm text-destructive">
        Failed to load commit: {error.message}
      </div>
    );
  }

  const commit = data?.repository?.commit;
  if (!commit) return null;

  const date = new Date(commit.date);
  const files = commit.files?.nodes ?? [];

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back
      </button>

      <div className="mb-6 rounded-md border border-border p-5">
        <div className="mb-1 flex items-start gap-3">
          <GitCommit className="mt-1 size-5 shrink-0 text-muted-foreground" />
          <h1 className="text-lg font-semibold leading-snug">{commit.message}</h1>
        </div>

        {commit.fullMessage.includes("\n") && (
          <pre className="mb-4 ml-8 mt-3 whitespace-pre-wrap font-sans text-sm text-muted-foreground">
            {commit.fullMessage.split("\n").slice(1).join("\n").trim()}
          </pre>
        )}

        <div className="ml-8 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{commit.authorName}</span>
            {commit.authorEmail && <span> &lt;{commit.authorEmail}&gt;</span>}
          </span>
          <span title={date.toISOString()}>{format(date, "PPP")}</span>
        </div>

        <div className="ml-8 mt-3 flex flex-wrap gap-3 text-xs">
          <span className="text-muted-foreground">
            commit <code className="font-mono text-foreground">{commit.hash}</code>
          </span>
          {commit.parents.map((p: string) => (
            <span key={p} className="text-muted-foreground">
              parent{" "}
              <Link
                to={repo ? `/${repo}/commit/${p}` : `/commit/${p}`}
                className="font-mono text-foreground hover:underline"
              >
                {p.slice(0, 7)}
              </Link>
            </span>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {files.length} file{files.length !== 1 ? "s" : ""} changed
        </h2>
        <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
          {files.length === 0 && (
            <p className="px-4 py-4 text-sm text-muted-foreground">No file changes.</p>
          )}
          {files.map((file: { path: string; oldPath?: string | null; status: string }) => (
            <FileDiffView
              key={file.path}
              hash={commit.hash}
              path={file.path}
              oldPath={file.oldPath ?? undefined}
              status={file.status}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CommitPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-24" />
      <div className="space-y-3 rounded-md border border-border p-5">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="divide-y divide-border rounded-md border border-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <Skeleton className="size-4" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
