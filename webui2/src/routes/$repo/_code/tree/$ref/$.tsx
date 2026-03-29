// Tree view: /$repo/tree/$ref/...path

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { createFileRoute } from "@tanstack/react-router";

import {
  GitObjectType,
  type GitTreeEntry,
  type GitLastCommit,
  type GitBlob,
} from "@/__generated__/graphql";
import { FileTree } from "@/components/code/FileTree";
import type { TreeEntryWithCommit } from "@/components/code/FileTree";
import { Markdown } from "@/components/content/Markdown";

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

const BLOB_QUERY = gql`
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

export const Route = createFileRoute("/$repo/_code/tree/$ref/$")({
  component: TreeView,
  beforeLoad: () => ({ viewMode: "tree" as const }),
});

function TreeView() {
  const { repo, ref: currentRef, _splat: currentPath = "" } = Route.useParams();
  const { ref: repoRef } = Route.useRouteContext();

  const { data: treeData, loading: treeLoading } = useQuery<TreeQueryData>(TREE_QUERY, {
    variables: { repo: repoRef, ref: currentRef, path: currentPath || null },
  });
  const entries: GitTreeEntry[] = treeData?.repository?.tree ?? [];

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
  const { data: readmeBlobData } = useQuery<ReadmeQueryData>(BLOB_QUERY, {
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
        loading={treeLoading}
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
