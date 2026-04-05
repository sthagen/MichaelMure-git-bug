import type { Meta, StoryObj } from "@storybook/react-vite";

import { Status } from "@/__generated__/graphql";
import { withRouter } from "@/../.storybook/decorators";

import { BugRow } from "./BugRow";

const meta = {
  component: BugRow,
  decorators: [withRouter],
} satisfies Meta<typeof BugRow>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
  id: "abc123",
  humanId: "a1b2c3",
  repo: "my-repo",
  author: {
    humanId: "user1",
    displayName: "Jane Doe",
    avatarUrl: null,
  },
  createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
};

export const OpenBug: Story = {
  args: {
    ...baseArgs,
    status: Status.Open,
    title: "Fix login page crash on empty email",
    labels: [
      { name: "bug", color: { R: 252, G: 41, B: 41 } },
      { name: "priority", color: { R: 255, G: 152, B: 0 } },
    ],
    commentCount: 3,
  },
};

export const ClosedBug: Story = {
  args: {
    ...baseArgs,
    status: Status.Closed,
    title: "Add dark mode support",
    labels: [{ name: "enhancement", color: { R: 163, G: 230, B: 53 } }],
    commentCount: 12,
  },
};

export const NoLabels: Story = {
  args: {
    ...baseArgs,
    status: Status.Open,
    title: "Simple bug with no labels",
    labels: [],
    commentCount: 0,
  },
};

export const LongTitle: Story = {
  args: {
    ...baseArgs,
    status: Status.Open,
    title:
      "This is a very long bug title that should demonstrate how the component handles overflow and wrapping when the title extends beyond the available space",
    labels: [
      { name: "bug", color: { R: 252, G: 41, B: 41 } },
      { name: "documentation", color: { R: 30, G: 80, B: 160 } },
      { name: "help wanted", color: { R: 0, G: 150, B: 136 } },
    ],
    commentCount: 42,
  },
};
