// Code browser page. Switches between tree view, file viewer, and commit
// history via ?type= search param. Ref is selected via ?ref=.

import { gql } from "@apollo/client";
import { useQuery, useReadQuery } from "@apollo/client/react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { AlertCircle, GitCommit } from "lucide-react";
import { useEffect } from "react";
import * as v from "valibot";

import {
  GitObjectType,
  type GitRef,
  type GitTreeEntry,
  type GitBlob,
  type GitLastCommit,
} from "@/__generated__/graphql";
import { CodeBreadcrumb } from "@/components/code/CodeBreadcrumb";
import { CommitList } from "@/components/code/CommitList";
import { FileTree } from "@/components/code/FileTree";
import type { TreeEntryWithCommit } from "@/components/code/FileTree";
import { FileViewer } from "@/components/code/FileViewer";
import { RefSelector } from "@/components/code/RefSelector";
import { Markdown } from "@/components/content/Markdown";
import { ButtonLink } from "@/components/ui/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepo } from "@/lib/repo";

const REFS_QUERY = gql`
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
  query CodePageBlob($repo: String, $ref: String!, $path: String!) {
    repository(ref: $repo) {
      blob(ref: $ref, path: $path) {
        path
        hash
        text
        size
        isBinary
        isTruncated
      }
    }
  }
`;

interface RefsQueryData {
  repository: {
    name: string;
    refs: { nodes: GitRef[] } | null;
  } | null;
}

interface TreeQueryData {
  repository: {
    tree: GitTreeEntry[] | null;
  } | null;
}

interface LastCommitsQueryData {
  repository: {
    lastCommits: GitLastCommit[] | null;
  } | null;
}

interface BlobQueryData {
  repository: {
    blob: GitBlob | null;
  } | null;
}

const codePageSearchSchema = v.object({
  ref: v.fallback(v.string(), ""),
  path: v.fallback(v.string(), ""),
  type: v.fallback(v.picklist(["tree", "blob", "commits"]), "tree"),
});

export type CodePageSearch = v.InferOutput<typeof codePageSearchSchema>;

type ViewMode = CodePageSearch["type"];

export const Route = createFileRoute("/$repo/")({
  component: RouteComponent,
  pendingComponent: CodePageSkeleton,
  validateSearch: (search) => v.parse(codePageSearchSchema, search),
  loader: async ({ context: { preloadQuery, ref } }) => {
    const refsRef = preloadQuery<RefsQueryData>(REFS_QUERY, {
      variables: { repo: ref },
    });
    return { refsRef: await preloadQuery.toPromise(refsRef) };
  },
});

function RouteComponent() {
  const repo = useRepo();
  const navigate = useNavigate({ from: "/$repo/" });
  const { ref: currentRef, path: currentPath, type: viewMode } = useSearch({ from: "/$repo/" });

  const { refsRef } = Route.useLoaderData();
  const { data: refsData, error: refsError } = useReadQuery(refsRef);
  const refs: GitRef[] = refsData?.repository?.refs?.nodes ?? [];

  // Set default ref once loaded
  useEffect(() => {
    if (refs.length === 0 || currentRef) return;
    const defaultRef = refs.find((r: GitRef) => r.isDefault) ?? refs[0];
    if (defaultRef) {
      void navigate({
        search: (prev) => ({ ...prev, ref: defaultRef.shortName }),
        replace: true,
      });
    }
  }, [refs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const inTreeMode = viewMode === "tree" && !!currentRef;
  const inBlobMode = viewMode === "blob" && !!currentRef && !!currentPath;

  const { data: treeData, loading: treeLoading } = useQuery<TreeQueryData>(TREE_QUERY, {
    variables: { repo, ref: currentRef, path: currentPath || null },
    skip: !inTreeMode,
  });
  const entries: GitTreeEntry[] = treeData?.repository?.tree ?? [];

  const entryNames = entries.map((e: GitTreeEntry) => e.name);
  const { data: lastCommitsData } = useQuery<LastCommitsQueryData>(LAST_COMMITS_QUERY, {
    variables: { repo, ref: currentRef, path: currentPath || null, names: entryNames },
    skip: !inTreeMode || entryNames.length === 0,
  });
  const lastCommitsByName = new Map<string, GitLastCommit>(
    (lastCommitsData?.repository?.lastCommits ?? []).map((lc: GitLastCommit) => [lc.name, lc]),
  );
  const entriesWithCommits: TreeEntryWithCommit[] = entries.map((e: GitTreeEntry) => ({
    ...e,
    lastCommit: lastCommitsByName.get(e.name)?.commit ?? undefined,
  }));

  const { data: blobData, loading: blobLoading } = useQuery<BlobQueryData>(BLOB_QUERY, {
    variables: { repo, ref: currentRef, path: currentPath },
    skip: !inBlobMode,
  });
  const blob: GitBlob | null = blobData?.repository?.blob ?? null;

  const readmeEntry = entries.find(
    (e: GitTreeEntry) =>
      e.type === GitObjectType.Blob && /^readme(\.md|\.txt|\.rst)?$/i.test(e.name),
  );
  const readmePath = readmeEntry
    ? currentPath
      ? `${currentPath}/${readmeEntry.name}`
      : readmeEntry.name
    : null;
  const { data: readmeBlobData } = useQuery<BlobQueryData>(BLOB_QUERY, {
    variables: { repo, ref: currentRef, path: readmePath },
    skip: !inTreeMode || !readmePath,
  });
  const readme: string | null = readmeBlobData?.repository?.blob?.text ?? null;

  const repoName = refsData?.repository?.name ?? repo ?? "default-repo";

  function navigateTo(path: string, type: ViewMode = "tree") {
    void navigate({ search: (prev) => ({ ...prev, path, type }) });
  }

  function handleEntryClick(entry: TreeEntryWithCommit) {
    const newPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
    navigateTo(newPath, entry.type === GitObjectType.Blob ? "blob" : "tree");
  }

  function handleNavigateUp() {
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    navigateTo(parts.join("/"), "tree");
  }

  function handleRefSelect(ref: GitRef) {
    void navigate({ search: { ref: ref.shortName, path: "", type: "tree" } });
  }

  if (refsError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="text-muted-foreground size-8" />
        <p className="text-sm font-medium">Code browser unavailable</p>
        <p className="text-muted-foreground max-w-sm text-xs">{refsError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CodeBreadcrumb
          repoName={repoName}
          ref={currentRef}
          path={currentPath}
          onNavigate={(p) => navigateTo(p, "tree")}
        />
        <div className="flex items-center gap-2">
          <ButtonLink
            to="/$repo"
            params={{ repo: repo! }}
            search={{
              ref: currentRef,
              path: currentPath,
              type: viewMode === "commits" ? "tree" : "commits",
            }}
            variant={viewMode === "commits" ? "secondary" : "outline"}
            size="sm"
          >
            <GitCommit className="size-3.5" />
            History
          </ButtonLink>
          <RefSelector refs={refs} currentRef={currentRef} onSelect={handleRefSelect} />
        </div>
      </div>

      {viewMode === "commits" ? (
        <CommitList ref_={currentRef} path={currentPath || undefined} />
      ) : viewMode === "tree" || !blob ? (
        <>
          <FileTree
            entries={entriesWithCommits}
            path={currentPath}
            loading={treeLoading}
            onNavigate={handleEntryClick}
            onNavigateUp={handleNavigateUp}
          />
          {readme && (
            <div className="rounded-md border">
              <div className="text-muted-foreground border-b px-4 py-2 text-xs font-medium">
                README
              </div>
              <div className="px-6 py-4">
                <Markdown content={readme} />
              </div>
            </div>
          )}
        </>
      ) : (
        <FileViewer blob={blob} loading={blobLoading} />
      )}
    </div>
  );
}

function CodePageSkeleton() {
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
