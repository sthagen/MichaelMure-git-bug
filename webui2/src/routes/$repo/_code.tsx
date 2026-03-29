// Pathless layout for the code browser. Preloads refs (branches/tags)
// and renders the shared header (breadcrumb + ref selector + history toggle).
// Child routes (tree, blob, commits) render inside the Outlet.

import { gql } from "@apollo/client";
import { useReadQuery } from "@apollo/client/react";
import { createFileRoute, Outlet, useMatchRoute, useParams } from "@tanstack/react-router";
import { GitCommit } from "lucide-react";

import type { GitRef } from "@/__generated__/graphql";
import { CodeBreadcrumb } from "@/components/code/CodeBreadcrumb";
import { RefSelector } from "@/components/code/RefSelector";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";

export const REFS_QUERY = gql`
  query CodePageRefs($repo: String) {
    repository(ref: $repo) {
      name
      refs {
        nodes {
          name
          shortName
          type
          hash
          isDefault
        }
      }
    }
  }
`;

export interface RefsQueryData {
  repository: {
    name: string;
    refs: { nodes: GitRef[] } | null;
  } | null;
}

export const Route = createFileRoute("/$repo/_code")({
  component: CodeLayout,
  pendingComponent: CodeLayoutSkeleton,
  beforeLoad: ({ context: { preloadQuery, ref } }) => {
    const refsRef = preloadQuery<RefsQueryData>(REFS_QUERY, {
      variables: { repo: ref },
    });
    return { refsRef };
  },
});

function CodeLayout() {
  const { repo } = Route.useParams();
  const { ref: repoRef } = Route.useRouteContext();
  const { refsRef } = Route.useRouteContext();
  const { data: refsData } = useReadQuery(refsRef);
  const refs: GitRef[] = refsData?.repository?.refs?.nodes ?? [];
  const repoName = refsData?.repository?.name ?? repoRef ?? "default-repo";

  // Read child route params (ref and splat path) via loose useParams
  const allParams = useParams({ strict: false }) as {
    ref?: string;
    _splat?: string;
  };
  const currentRef = allParams.ref ?? "";
  const currentPath = allParams._splat ?? "";

  const matchRoute = useMatchRoute();
  const isCommitsView = !!matchRoute({
    to: "/$repo/commits/$ref",
    params: { repo, ref: currentRef },
    fuzzy: true,
  });

  function handleRefSelect(ref: GitRef) {
    // When switching refs, always go to tree root
    window.location.href = `/${repo}/tree/${ref.shortName}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CodeBreadcrumb
          repoName={repoName}
          currentRef={currentRef}
          path={currentPath}
          repo={repo}
        />
        <div className="flex items-center gap-2">
          {isCommitsView ? (
            <ButtonLink
              to="/$repo/tree/$ref/$"
              params={{ repo, ref: currentRef, _splat: currentPath }}
              variant="secondary"
              size="sm"
            >
              <GitCommit className="size-3.5" />
              History
            </ButtonLink>
          ) : (
            <ButtonLink
              to="/$repo/commits/$ref"
              params={{ repo, ref: currentRef }}
              variant="outline"
              size="sm"
            >
              <GitCommit className="size-3.5" />
              History
            </ButtonLink>
          )}
          <RefSelector refs={refs} currentRef={currentRef} onSelect={handleRefSelect} />
        </div>
      </div>

      <Outlet />
    </div>
  );
}

function CodeLayoutSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="divide-border border-border divide-y rounded-md border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2">
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
