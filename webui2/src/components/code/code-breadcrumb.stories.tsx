import type { Meta, StoryObj } from "@storybook/react-vite";

import { withRouter } from "@/../.storybook/decorators";

import { CodeBreadcrumb } from "./code-breadcrumb";

const meta = {
  component: CodeBreadcrumb,
  decorators: [withRouter],
} satisfies Meta<typeof CodeBreadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RootPath: Story = {
  args: {
    repoName: "git-bug",
    currentRef: "main",
    path: "",
    repo: "git-bug",
  },
};

export const FilePath: Story = {
  args: {
    repoName: "git-bug",
    currentRef: "main",
    path: "src/components/ui/button.tsx",
    repo: "git-bug",
  },
};

export const DeepPath: Story = {
  args: {
    repoName: "git-bug",
    currentRef: "feature/auth",
    path: "src/components/bugs/timeline/CommentItem.tsx",
    repo: "git-bug",
  },
};
