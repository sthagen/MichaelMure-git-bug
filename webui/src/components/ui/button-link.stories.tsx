// TanStack Router Link styled as a Button. Used for navigation actions
// like "New issue" in the header.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus } from "lucide-react";

import { withRouter } from "@/../.storybook/decorators";

import { ButtonLink } from "./button-link";

const meta = {
  component: ButtonLink,
  decorators: [withRouter],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ButtonLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    to: "/",
    children: "View issues",
  },
};

export const Outline: Story = {
  args: {
    to: "/",
    variant: "outline",
    children: "Go back",
  },
};

export const SmallWithIcon: Story = {
  args: {
    to: "/",
    size: "sm",
    children: (
      <>
        <Plus className="size-4" />
        New issue
      </>
    ),
  },
};
