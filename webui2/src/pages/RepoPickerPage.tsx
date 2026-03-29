// Repository picker page (/). Auto-redirects when there is exactly one repo.
// Shows a list when multiple repos are registered.

import { GitFork, FolderOpen, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";

import { useRepositoriesQuery } from "@/__generated__/graphql";
import { Skeleton } from "@/components/ui/skeleton";

function repoSlug(name: string | null | undefined): string {
  return name ?? "_";
}

function repoLabel(name: string | null | undefined): string {
  return name ?? "default";
}

export function RepoPickerPage() {
  const { data, loading, error } = useRepositoriesQuery();
  const navigate = useNavigate();

  // Auto-redirect when there is exactly one repo — no need to pick.
  useEffect(() => {
    if (data?.repositories.nodes.length === 1) {
      navigate("/" + repoSlug(data.repositories.nodes[0].name), { replace: true });
    }
  }, [data, navigate]);

  return (
    <div className="mx-auto max-w-lg py-12">
      <div className="mb-8 flex items-center gap-3">
        <GitFork className="size-6 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Repositories</h1>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          Failed to load repositories: {error.message}
        </div>
      )}

      {loading && !data && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      )}

      <div className="divide-y divide-border rounded-md border border-border">
        {data?.repositories.nodes.map((repo) => (
          <Link
            key={repoSlug(repo.name)}
            to={`/${repoSlug(repo.name)}`}
            className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/50"
          >
            <FolderOpen className="size-5 shrink-0 text-muted-foreground" />
            <p className="font-medium text-foreground">{repoLabel(repo.name)}</p>
          </Link>
        ))}

        {data?.repositories.totalCount === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No repositories found.
          </p>
        )}
      </div>
    </div>
  );
}
