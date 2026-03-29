// Repository picker page (/). Auto-redirects when there is exactly one repo.
// Shows a list when multiple repos are registered.

import { useReadQuery } from "@apollo/client/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GitFork, FolderOpen, AlertCircle } from "lucide-react";
import { useEffect } from "react";

import { type RepositoriesQuery, RepositoriesDocument } from "@/__generated__/graphql";
import { preloadQuery } from "@/lib/apollo";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: () => ({
    repositoriesRef: preloadQuery<RepositoriesQuery>(RepositoriesDocument),
  }),
});

function repoSlug(name: string | null | undefined): string {
  return name ?? "_";
}

function repoLabel(name: string | null | undefined): string {
  return name ?? "default";
}

function RouteComponent() {
  const { repositoriesRef } = Route.useLoaderData();
  const { data, error } = useReadQuery(repositoriesRef);
  const navigate = useNavigate();

  // Auto-redirect when there is exactly one repo — no need to pick.
  useEffect(() => {
    if (data?.repositories.nodes.length === 1) {
      void navigate({
        to: "/$repo",
        params: { repo: repoSlug(data.repositories.nodes[0].name) },
        search: { ref: "", path: "", type: "tree" as const },
        replace: true,
      });
    }
  }, [data, navigate]);

  return (
    <div className="mx-auto max-w-lg py-12">
      <div className="mb-8 flex items-center gap-3">
        <GitFork className="text-muted-foreground size-6" />
        <h1 className="text-xl font-semibold">Repositories</h1>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-4 py-3 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          Failed to load repositories: {error.message}
        </div>
      )}

      <div className="divide-border border-border divide-y rounded-md border">
        {data?.repositories.nodes.map((repo) => (
          <Link
            key={repoSlug(repo.name)}
            to="/$repo"
            params={{ repo: repoSlug(repo.name) }}
            search={{ ref: "", path: "", type: "tree" as const }}
            className="hover:bg-muted/50 flex items-center gap-3 px-4 py-4 transition-colors"
          >
            <FolderOpen className="text-muted-foreground size-5 shrink-0" />
            <p className="text-foreground font-medium">{repoLabel(repo.name)}</p>
          </Link>
        ))}

        {data?.repositories.totalCount === 0 && (
          <p className="text-muted-foreground px-4 py-8 text-center text-sm">
            No repositories found.
          </p>
        )}
      </div>
    </div>
  );
}
