import type { Meta, StoryObj } from "@storybook/react-vite";

import { EmptyState } from "./empty-state";

const meta = {
  component: EmptyState,
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "No open issues found." },
};

export const NotFound: Story = {
  args: { children: "Issue not found." },
};
