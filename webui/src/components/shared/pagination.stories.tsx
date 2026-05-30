import type { Meta, StoryObj } from "@storybook/react-vite";

import { withRouter } from "@/../.storybook/decorators";

import * as Pagination from "./pagination";

const meta = {
  component: Pagination.Root,
  decorators: [withRouter],
} satisfies Meta<typeof Pagination.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: () => (
    <div className="border-border rounded-md border">
      <div className="px-4 py-8 text-center text-sm">Content above pagination</div>
      <Pagination.Root>
        <Pagination.Previous to="/" disabled />
        <Pagination.Info>Page 1 of 5</Pagination.Info>
        <Pagination.Next to="/" />
      </Pagination.Root>
    </div>
  ),
};

export const MiddlePage: Story = {
  args: { children: null },
  render: () => (
    <Pagination.Root>
      <Pagination.Previous to="/" />
      <Pagination.Info>Page 3 of 5</Pagination.Info>
      <Pagination.Next to="/" />
    </Pagination.Root>
  ),
};

export const LastPage: Story = {
  args: { children: null },
  render: () => (
    <Pagination.Root>
      <Pagination.Previous to="/" />
      <Pagination.Info>Page 5 of 5</Pagination.Info>
      <Pagination.Next to="/" disabled />
    </Pagination.Root>
  ),
};
