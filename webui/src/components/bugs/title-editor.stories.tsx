import type { Meta, StoryObj } from "@storybook/react-vite";

import { withApollo } from "@/../.storybook/decorators";

import { TitleEditor } from "./title-editor";

const meta = {
  component: TitleEditor,
  decorators: [withApollo],
} satisfies Meta<typeof TitleEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    bugPrefix: "abc123",
    title: "Fix login page crash on empty email",
    humanId: "a1b2c3",
  },
};

export const LongTitle: Story = {
  args: {
    bugPrefix: "def456",
    title:
      "Very long issue title that spans multiple lines and tests how the component handles overflow in the layout",
    humanId: "d4e5f6",
  },
};
