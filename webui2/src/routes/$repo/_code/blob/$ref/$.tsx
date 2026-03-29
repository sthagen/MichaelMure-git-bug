// Blob (file) view: /$repo/blob/$ref/...path

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { createFileRoute } from "@tanstack/react-router";

import type { GitBlob } from "@/__generated__/graphql";
import { FileViewer } from "@/components/code/FileViewer";

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

interface BlobQueryData {
  repository: { blob: GitBlob | null } | null;
}

export const Route = createFileRoute("/$repo/_code/blob/$ref/$")({
  component: BlobView,
});

function BlobView() {
  const { ref: currentRef, _splat: currentPath = "" } = Route.useParams();
  const { ref: repoRef } = Route.useRouteContext();

  const { data, loading } = useQuery<BlobQueryData>(BLOB_QUERY, {
    variables: { repo: repoRef, ref: currentRef, path: currentPath },
    skip: !currentPath,
  });

  return <FileViewer blob={data?.repository?.blob ?? null} loading={loading} />;
}
