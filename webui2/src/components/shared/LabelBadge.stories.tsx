import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import type { LabelFieldsFragment } from "@/__generated__/graphql";

import { LabelBadge } from "./LabelBadge";

const meta = {
  component: LabelBadge,
} satisfies Meta<typeof LabelBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data shaped like LabelFieldsFragment from GraphQL
const bug: LabelFieldsFragment = { name: "bug", color: { R: 252, G: 41, B: 41 } };
const enhancement: LabelFieldsFragment = { name: "enhancement", color: { R: 163, G: 230, B: 53 } };
const documentation: LabelFieldsFragment = { name: "documentation", color: { R: 30, G: 80, B: 160 } };
const helpWanted: LabelFieldsFragment = { name: "help wanted", color: { R: 0, G: 150, B: 136 } };
const wontfix: LabelFieldsFragment = { name: "wontfix", color: { R: 200, G: 200, B: 200 } };
const priority: LabelFieldsFragment = { name: "priority", color: { R: 255, G: 152, B: 0 } };

const allLabels = [bug, enhancement, documentation, helpWanted, wontfix, priority];

export const Default: Story = {
  args: bug,
};

export const LightBackground: Story = {
  args: enhancement,
};

export const DarkBackground: Story = {
  args: documentation,
};

export const Clickable: Story = {
  args: { ...helpWanted, onClick: fn() },
};

export const AllColors: Story = {
  args: bug,
  render: () => (
    <div className="flex flex-wrap gap-2">
      {allLabels.map((label) => (
        <LabelBadge key={label.name} {...label} />
      ))}
    </div>
  ),
};
