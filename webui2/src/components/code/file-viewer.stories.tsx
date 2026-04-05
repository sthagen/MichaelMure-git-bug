import type { Meta, StoryObj } from "@storybook/react-vite";

import { FileViewer } from "./file-viewer";

const meta = {
  component: FileViewer,
} satisfies Meta<typeof FileViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypeScriptFile: Story = {
  args: {
    blob: {
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
    },
  },
};

export const BinaryFile: Story = {
  args: {
    blob: {
      text: null,
      hash: "def456",
      path: "logo.png",
      size: 24576,
      isBinary: true,
      isTruncated: false,
    },
  },
};

export const TruncatedFile: Story = {
  args: {
    blob: {
      text: "line 1\nline 2\nline 3\n... (truncated)",
      hash: "ghi789",
      path: "large-file.log",
      size: 1048576,
      isBinary: false,
      isTruncated: true,
    },
  },
};

export const Loading: Story = {
  args: {
    blob: null,
  },
};
