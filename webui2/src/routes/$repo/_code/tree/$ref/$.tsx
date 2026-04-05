// Tree view: /$repo/tree/$ref/...path

import { gql } from "@apollo/client";
import { useQuery, useReadQuery } from "@apollo/client/react";
import { createFileRoute } from "@tanstack/react-router";

import {
  GitObjectType,
  type GitTreeEntry,
  type GitLastCommit,
  type GitBlob,
} from "@/__generated__/graphql";
import { FileTree } from "@/components/code/file-tree";
import type { TreeEntryWithCommit } from "@/components/code/file-tree";
import { Markdown } from "@/components/content/markdown";
import { Skeleton } from "@/components/ui/skeleton";

const TREE_QUERY = gql`
  query CodePageTree($repo: String, $ref: String!, $path: String) {
    repository(ref: $repo) {
      tree(ref: $ref, path: $path) {
        name
        type
        hash
      }
    }
  }
`;

const LAST_COMMITS_QUERY = gql`
  query CodePageLastCommits($repo: String, $ref: String!, $path: String, $names: [String!]!) {
    repository(ref: $repo) {
      lastCommits(ref: $ref, path: $path, names: $names) {
        name
        commit {
          hash
          shortHash
          message
          date
        }
      }
    }
  }
`;

const README_QUERY = gql`
  query CodePageReadme($repo: String, $ref: String!, $path: String!) {
    repository(ref: $repo) {
      blob(ref: $ref, path: $path) {
        text
      }
    }
  }
`;

interface TreeQueryData {
  repository: { tree: GitTreeEntry[] | null } | null;
}
interface LastCommitsQueryData {
  repository: { lastCommits: GitLastCommit[] | null } | null;
}
interface ReadmeQueryData {
  repository: { blob: GitBlob | null } | null;
}

function TreeSkeleton() {
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

export const Route = createFileRoute("/$repo/_code/tree/$ref/$")({
  component: TreeView,
  pendingComponent: TreeSkeleton,
  beforeLoad: () => ({ viewMode: "tree" as const }),
  loader: async ({ context: { preloadQuery, ref }, params: { ref: gitRef, _splat: path } }) => {
    const treeRef = preloadQuery<TreeQueryData>(TREE_QUERY, {
      variables: { repo: ref, ref: gitRef, path: path || null },
    });
    return { treeRef: await preloadQuery.toPromise(treeRef) };
  },
});

function TreeView() {
  const { repo, ref: currentRef, _splat: currentPath = "" } = Route.useParams();
  const { ref: repoRef } = Route.useRouteContext();
  const { treeRef } = Route.useLoaderData();
  const { data: treeData } = useReadQuery(treeRef);
  const entries: GitTreeEntry[] = treeData?.repository?.tree ?? [];

  // Last commits and readme are cascading queries — they depend on the tree result
  const entryNames = entries.map((e) => e.name);
  const { data: lastCommitsData } = useQuery<LastCommitsQueryData>(LAST_COMMITS_QUERY, {
    variables: { repo: repoRef, ref: currentRef, path: currentPath || null, names: entryNames },
    skip: entryNames.length === 0,
  });
  const lastCommitsByName = new Map<string, GitLastCommit>(
    (lastCommitsData?.repository?.lastCommits ?? []).map((lc) => [lc.name, lc]),
  );
  const entriesWithCommits: TreeEntryWithCommit[] = entries.map((e) => ({
    ...e,
    lastCommit: lastCommitsByName.get(e.name)?.commit ?? undefined,
  }));

  const readmeEntry = entries.find(
    (e) => e.type === GitObjectType.Blob && /^readme(\.md|\.txt|\.rst)?$/i.test(e.name),
  );
  const readmePath = readmeEntry
    ? currentPath
      ? `${currentPath}/${readmeEntry.name}`
      : readmeEntry.name
    : null;
  const { data: readmeBlobData } = useQuery<ReadmeQueryData>(README_QUERY, {
    variables: { repo: repoRef, ref: currentRef, path: readmePath },
    skip: !readmePath,
  });
  const readme: string | null = readmeBlobData?.repository?.blob?.text ?? null;

  return (
    <>
      <FileTree
        repo={repo}
        currentRef={currentRef}
        currentPath={currentPath}
        entries={entriesWithCommits}
      />
      {readme && (
        <div className="rounded-md border">
          <div className="text-muted-foreground border-b px-4 py-2 text-xs font-medium">README</div>
          <div className="px-6 py-4">
            <Markdown
              content={readme}
              repoContext={{ repo, ref: currentRef, basePath: currentPath }}
            />
          </div>
        </div>
      )}
    </>
  );
}
