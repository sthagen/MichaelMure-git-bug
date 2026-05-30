import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./input";

const meta = {
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Type something…" },
};

export const WithValue: Story = {
  parameters: { a11y: { disable: true } },
  args: { defaultValue: "Hello world" },
};

export const Disabled: Story = {
  args: { placeholder: "Disabled", disabled: true },
};

export const Password: Story = {
  args: { type: "password", placeholder: "Enter password" },
};
