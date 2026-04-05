import type { Meta, StoryObj } from "@storybook/react-vite";

import { SectionHeading } from "./section-heading";

const meta = {
  component: SectionHeading,
} satisfies Meta<typeof SectionHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Participants" },
};

export const Labels: Story = {
  args: { children: "Labels" },
};
