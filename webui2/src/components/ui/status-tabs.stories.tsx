import type { Meta, StoryObj } from "@storybook/react-vite";

import * as StatusTabs from "./status-tabs";

const meta = {
  component: StatusTabs.Root,
} satisfies Meta<typeof StatusTabs.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: () => (
    <StatusTabs.Root>
      <button className="bg-accent text-accent-foreground flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium">
        <StatusTabs.OpenIndicator />
        Open
        <StatusTabs.Count>12</StatusTabs.Count>
      </button>
      <button className="text-muted-foreground hover:bg-accent/50 hover:text-foreground flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium">
        <StatusTabs.ClosedIndicator />
        Closed
        <StatusTabs.Count>5</StatusTabs.Count>
      </button>
    </StatusTabs.Root>
  ),
};
