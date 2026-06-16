import type { Meta, StoryObj } from "@storybook/react-vite";

import { withApollo, withCachedFragments, withRepoRouter } from "@/../.storybook/decorators";
import { makeFragmentData } from "@/__generated__/fragment-masking";

import { FileContent } from "./file-content";
import { FILE_VIEWER_BLOB_FRAGMENT } from "./file-viewer";

const markdownBlobData = {
  __typename: "GitBlob" as const,
  text: `# Project Title

A short description with **bold**, _italic_, and a [link](https://example.com).

## Features

- Rendered by default
- Toggle to view source

\`\`\`ts
export const answer = 42;
\`\`\`
`,
  hash: "md123",
  path: "README.md",
  size: 200,
  isBinary: false,
  isTruncated: false,
};

const sourceBlobData = {
  __typename: "GitBlob" as const,
  text: `package main

func main() {
  println("hello")
}`,
  hash: "go456",
  path: "main.go",
  size: 64,
  isBinary: false,
  isTruncated: false,
};

const meta = {
  component: FileContent,
  decorators: [
    withApollo,
    withCachedFragments(
      [FILE_VIEWER_BLOB_FRAGMENT, "FileViewerBlob", markdownBlobData],
      [FILE_VIEWER_BLOB_FRAGMENT, "FileViewerBlob", sourceBlobData],
    ),
    withRepoRouter,
  ],
  args: { repo: "_", gitRef: "main" },
  // Skip browser tests — composes FileViewer, whose Shiki WASM engine doesn't
  // load in Vitest browser mode. Snapshot tests (happy-dom) still cover this.
  tags: ["!test"],
} satisfies Meta<typeof FileContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const markdownBlob = makeFragmentData(markdownBlobData, FILE_VIEWER_BLOB_FRAGMENT);
const sourceBlob = makeFragmentData(sourceBlobData, FILE_VIEWER_BLOB_FRAGMENT);

// Markdown file: rendered by default, with a toggle to view source.
export const MarkdownFile: Story = {
  args: { blob: markdownBlob },
};

// Non-markdown file: falls back to the source viewer (no toggle).
export const SourceFile: Story = {
  args: { blob: sourceBlob },
};
