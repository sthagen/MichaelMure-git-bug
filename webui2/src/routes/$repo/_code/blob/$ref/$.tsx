// Blob (file) view: /$repo/blob/$ref/...path

import { useReadQuery } from "@apollo/client/react";
import { createFileRoute } from "@tanstack/react-router";

import { graphql } from "@/__generated__/gql";
import { FileViewer } from "@/components/code/file-viewer";
import { Skeleton } from "@/components/ui/skeleton";

const BLOB_QUERY = graphql(`
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
`);

function BlobSkeleton() {
  return (
    <div className="border-border overflow-hidden rounded-md border">
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="p-4">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/$repo/_code/blob/$ref/$")({
  component: BlobView,
  pendingComponent: BlobSkeleton,
  beforeLoad: () => ({ viewMode: "blob" as const }),
  loader: async ({ context: { preloadQuery, ref }, params: { ref: gitRef, _splat: path } }) => {
    const blobRef = preloadQuery(BLOB_QUERY, {
      variables: { repo: ref, ref: gitRef, path: path || "" },
    });
    return { blobRef: await preloadQuery.toPromise(blobRef) };
  },
});

function BlobView() {
  const { blobRef } = Route.useLoaderData();
  const { data } = useReadQuery(blobRef);

  return <FileViewer blob={data?.repository?.blob ?? null} />;
}
