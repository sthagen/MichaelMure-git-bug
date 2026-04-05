import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { LabelBadge } from "./LabelBadge";

const meta = {
  component: LabelBadge,
} satisfies Meta<typeof LabelBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "bug",
    color: { R: 252, G: 41, B: 41 },
  },
};

export const LightBackground: Story = {
  args: {
    name: "enhancement",
    color: { R: 163, G: 230, B: 53 },
  },
};

export const DarkBackground: Story = {
  args: {
    name: "documentation",
    color: { R: 30, G: 80, B: 160 },
  },
};

export const Clickable: Story = {
  args: {
    name: "feature",
    color: { R: 100, G: 200, B: 150 },
    onClick: fn(),
  },
};

export const AllColors: Story = {
  args: { name: "", color: { R: 0, G: 0, B: 0 } },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <LabelBadge name="bug" color={{ R: 252, G: 41, B: 41 }} />
      <LabelBadge name="enhancement" color={{ R: 163, G: 230, B: 53 }} />
      <LabelBadge name="documentation" color={{ R: 30, G: 80, B: 160 }} />
      <LabelBadge name="help wanted" color={{ R: 0, G: 150, B: 136 }} />
      <LabelBadge name="wontfix" color={{ R: 200, G: 200, B: 200 }} />
      <LabelBadge name="priority" color={{ R: 255, G: 152, B: 0 }} />
    </div>
  ),
};
