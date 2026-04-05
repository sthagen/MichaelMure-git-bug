import type { Meta, StoryObj } from "@storybook/react-vite";

import * as CommentCard from "./comment-card";

const meta = {
  component: CommentCard.Root,
} satisfies Meta<typeof CommentCard.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: () => (
    <CommentCard.Root>
      <CommentCard.AuthorAvatar name="Jane Doe" />
      <CommentCard.Card>
        <CommentCard.CardHeader>
          <span className="text-foreground font-medium">Jane Doe</span>
          <span className="text-muted-foreground">2 hours ago</span>
        </CommentCard.CardHeader>
        <CommentCard.CardBody>
          <p className="text-sm">This is a comment body with some text content.</p>
        </CommentCard.CardBody>
      </CommentCard.Card>
    </CommentCard.Root>
  ),
};

export const WithEditButton: Story = {
  args: { children: null },
  render: () => (
    <CommentCard.Root>
      <CommentCard.AuthorAvatar name="Bob Smith" src="https://github.com/shadcn.png" />
      <CommentCard.Card>
        <CommentCard.CardHeader>
          <span className="text-foreground font-medium">Bob Smith</span>
          <span className="text-muted-foreground">1 day ago</span>
          <span className="text-muted-foreground text-xs">edited</span>
          <button className="text-muted-foreground hover:bg-muted ml-auto rounded-sm px-1.5 py-0.5 text-xs">
            Edit
          </button>
        </CommentCard.CardHeader>
        <CommentCard.CardBody>
          <p className="text-sm">Updated the configuration to fix the build issue.</p>
        </CommentCard.CardBody>
      </CommentCard.Card>
    </CommentCard.Root>
  ),
};

export const EmptyBody: Story = {
  args: { children: null },
  render: () => (
    <CommentCard.Root>
      <CommentCard.AuthorAvatar name="Alice Wu" />
      <CommentCard.Card>
        <CommentCard.CardHeader>
          <span className="text-foreground font-medium">Alice Wu</span>
          <span className="text-muted-foreground">just now</span>
        </CommentCard.CardHeader>
        <CommentCard.CardBody>
          <p className="text-muted-foreground text-sm italic">No description provided.</p>
        </CommentCard.CardBody>
      </CommentCard.Card>
    </CommentCard.Root>
  ),
};
