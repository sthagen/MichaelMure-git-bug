import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "./textarea";

const meta = {
  component: Textarea,
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Write a comment…" },
};

export const WithValue: Story = {
  parameters: { a11y: { disable: true } },
  args: { defaultValue: "This is some content in the textarea." },
};

export const Disabled: Story = {
  args: { placeholder: "Disabled", disabled: true },
};
