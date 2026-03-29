// Code browser page. Switches between tree view, file viewer, and commit
// history via ?type= search param. Ref is selected via ?ref=.

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { AlertCircle, GitCommit } from "lucide-react";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

import type { GitRef, GitTreeEntry, GitBlob, GitLastCommit } from "@/__generated__/graphql";
import { CodeBreadcrumb } from "@/components/code/CodeBreadcrumb";
import { CommitList } from "@/components/code/CommitList";
import { FileTree } from "@/components/code/FileTree";
import type { TreeEntryWithCommit } from "@/components/code/FileTree";
import { FileViewer } from "@/components/code/FileViewer";
import { RefSelector } from "@/components/code/RefSelector";
import { Markdown } from "@/components/content/Markdown";
import { Button } from "@/components/ui/button";
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

type ViewMode = "tree" | "blob" | "commits";

export function CodePage() {
  const repo = useRepo();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentRef = searchParams.get("ref") ?? "";
  const currentPath = searchParams.get("path") ?? "";
  const viewMode: ViewMode = (searchParams.get("type") as ViewMode) ?? "tree";

  const {
    data: refsData,
    loading: refsLoading,
    error: refsError,
  } = useQuery<RefsQueryData>(REFS_QUERY, {
    variables: { repo },
  });
  const refs: GitRef[] = refsData?.repository?.refs?.nodes ?? [];

  // Set default ref from query result once loaded
  useEffect(() => {
    if (refsLoading || refs.length === 0 || searchParams.get("ref")) return;
    const defaultRef = refs.find((r: GitRef) => r.isDefault) ?? refs[0];
    if (defaultRef) {
      setSearchParams(
        (prev) => {
          prev.set("ref", defaultRef.shortName);
          return prev;
        },
        { replace: true },
      );
    }
  }, [refsLoading, refs.length]); // eslint-disable-line react-hooks/exhaustive-deps

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
    (e: GitTreeEntry) => e.type === "BLOB" && /^readme(\.md|\.txt|\.rst)?$/i.test(e.name),
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

  function navigate(path: string, type: ViewMode = "tree") {
    setSearchParams((prev) => {
      prev.set("path", path);
      prev.set("type", type);
      return prev;
    });
  }

  function handleEntryClick(entry: TreeEntryWithCommit) {
    const newPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
    navigate(newPath, entry.type === "BLOB" ? "blob" : "tree");
  }

  function handleNavigateUp() {
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    navigate(parts.join("/"), "tree");
  }

  function handleRefSelect(ref: GitRef) {
    setSearchParams((prev) => {
      prev.set("ref", ref.shortName);
      prev.set("path", "");
      prev.set("type", "tree");
      return prev;
    });
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
        {refsLoading ? (
          <Skeleton className="h-5 w-48" />
        ) : (
          <CodeBreadcrumb
            repoName={repoName}
            ref={currentRef}
            path={currentPath}
            onNavigate={(p) => navigate(p, "tree")}
          />
        )}
        <div className="flex items-center gap-2">
          {!refsLoading && (
            <Button
              variant={viewMode === "commits" ? "secondary" : "outline"}
              size="sm"
              onClick={() => navigate(currentPath, viewMode === "commits" ? "tree" : "commits")}
            >
              <GitCommit className="size-3.5" />
              History
            </Button>
          )}
          {refsLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <RefSelector refs={refs} currentRef={currentRef} onSelect={handleRefSelect} />
          )}
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
