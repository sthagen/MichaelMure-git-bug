import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { GitRefType } from "@/__generated__/graphql";

import { RefSelector } from "./ref-selector";

const meta = {
  component: RefSelector,
  parameters: { a11y: { disable: true } },
} satisfies Meta<typeof RefSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleRefs = [
  { name: "refs/heads/main", shortName: "main", type: GitRefType.Branch, hash: "abc1", isDefault: true },
  { name: "refs/heads/develop", shortName: "develop", type: GitRefType.Branch, hash: "abc2", isDefault: false },
  { name: "refs/heads/feature/auth", shortName: "feature/auth", type: GitRefType.Branch, hash: "abc3", isDefault: false },
  { name: "refs/heads/fix/login", shortName: "fix/login", type: GitRefType.Branch, hash: "abc4", isDefault: false },
  { name: "refs/tags/v1.0.0", shortName: "v1.0.0", type: GitRefType.Tag, hash: "abc5", isDefault: false },
  { name: "refs/tags/v1.1.0", shortName: "v1.1.0", type: GitRefType.Tag, hash: "abc6", isDefault: false },
  { name: "refs/tags/v2.0.0-rc1", shortName: "v2.0.0-rc1", type: GitRefType.Tag, hash: "abc7", isDefault: false },
];

export const Default: Story = {
  args: {
    gitRefs: sampleRefs,
    currentRef: "main",
    onSelect: fn(),
  },
};

export const OnTag: Story = {
  args: {
    gitRefs: sampleRefs,
    currentRef: "v1.1.0",
    onSelect: fn(),
  },
};

export const BranchesOnly: Story = {
  args: {
    gitRefs: sampleRefs.filter((r) => r.type === GitRefType.Branch),
    currentRef: "develop",
    onSelect: fn(),
  },
};
