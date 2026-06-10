import type { Meta, StoryObj } from "@storybook/react-vite";

import { withApollo, withCachedFragments } from "@/../.storybook/decorators";
import { makeFragmentData } from "@/__generated__/fragment-masking";
import { Skeleton } from "@/components/ui/skeleton";

import { FileViewer, FILE_VIEWER_BLOB_FRAGMENT } from "./file-viewer";

const typescriptBlobData = {
  __typename: "GitBlob" as const,
  text: `import { useState } from "react";

interface CounterProps {
  initial?: number;
}

export function Counter({ initial = 0 }: CounterProps) {
  const [count, setCount] = useState(initial);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  );
}`,
  hash: "abc123",
  path: "src/Counter.tsx",
  size: 312,
  isBinary: false,
  isTruncated: false,
};

const binaryBlobData = {
  __typename: "GitBlob" as const,
  text: null,
  hash: "def456",
  path: "logo.png",
  size: 24576,
  isBinary: true,
  isTruncated: false,
};

const truncatedBlobData = {
  __typename: "GitBlob" as const,
  text: "line 1\nline 2\nline 3\n... (truncated)",
  hash: "ghi789",
  path: "large-file.log",
  size: 1048576,
  isBinary: false,
  isTruncated: true,
};

const meta = {
  component: FileViewer,
  decorators: [
    withApollo,
    withCachedFragments(
      [FILE_VIEWER_BLOB_FRAGMENT, "FileViewerBlob", typescriptBlobData],
      [FILE_VIEWER_BLOB_FRAGMENT, "FileViewerBlob", binaryBlobData],
      [FILE_VIEWER_BLOB_FRAGMENT, "FileViewerBlob", truncatedBlobData],
    ),
  ],
  // Skip browser tests — Shiki's WASM engine doesn't load in Vitest browser mode.
  // Snapshot tests (happy-dom) still cover this component.
  tags: ["!test"],
} satisfies Meta<typeof FileViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

const typescriptBlob = makeFragmentData(typescriptBlobData, FILE_VIEWER_BLOB_FRAGMENT);
const binaryBlob = makeFragmentData(binaryBlobData, FILE_VIEWER_BLOB_FRAGMENT);
const truncatedBlob = makeFragmentData(truncatedBlobData, FILE_VIEWER_BLOB_FRAGMENT);

export const TypeScriptFile: Story = {
  args: {
    blob: typescriptBlob,
  },
};

export const BinaryFile: Story = {
  args: {
    blob: binaryBlob,
  },
};

export const TruncatedFile: Story = {
  args: {
    blob: truncatedBlob,
  },
};

export const Loading: Story = {
  args: { blob: typescriptBlob },
  render: () => (
    <div className="border-border overflow-hidden rounded-md border">
      <div className="bg-muted/40 border-border flex items-center justify-between border-b px-4 py-2">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex">
        <div className="flex flex-col items-end gap-1 px-3 py-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-3.5 w-6" />
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-1 py-3 pr-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-3.5" style={{ width: `${30 + ((i * 47) % 60)}%` }} />
          ))}
        </div>
      </div>
    </div>
  ),
};
