import type { Meta, StoryObj } from "@storybook/react-vite";

import type { IdentitySummaryFragment } from "@/__generated__/graphql";

import * as CommentCard from "./comment-card";

const meta = {
  component: CommentCard.Root,
  parameters: { a11y: { disable: true } },
} satisfies Meta<typeof CommentCard.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data shaped like IdentitySummaryFragment
const jane: IdentitySummaryFragment = {
  id: "1",
  humanId: "jane1",
  displayName: "Jane Doe",
  avatarUrl: null,
};

const bob: IdentitySummaryFragment = {
  id: "2",
  humanId: "bob1",
  displayName: "Bob Smith",
  avatarUrl: "https://github.com/shadcn.png",
};

const alice: IdentitySummaryFragment = {
  id: "3",
  humanId: "alice1",
  displayName: "Alice Wu",
  avatarUrl: null,
};

export const Default: Story = {
  args: { children: null },
  render: () => (
    <CommentCard.Root>
      <CommentCard.AuthorAvatar displayName={jane.displayName} avatarUrl={jane.avatarUrl} />
      <CommentCard.Card>
        <CommentCard.CardHeader>
          <span className="text-foreground font-medium">{jane.displayName}</span>
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
      <CommentCard.AuthorAvatar displayName={bob.displayName} avatarUrl={bob.avatarUrl} />
      <CommentCard.Card>
        <CommentCard.CardHeader>
          <span className="text-foreground font-medium">{bob.displayName}</span>
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
      <CommentCard.AuthorAvatar displayName={alice.displayName} avatarUrl={alice.avatarUrl} />
      <CommentCard.Card>
        <CommentCard.CardHeader>
          <span className="text-foreground font-medium">{alice.displayName}</span>
          <span className="text-muted-foreground">just now</span>
        </CommentCard.CardHeader>
        <CommentCard.CardBody>
          <p className="text-muted-foreground text-sm italic">No description provided.</p>
        </CommentCard.CardBody>
      </CommentCard.Card>
    </CommentCard.Root>
  ),
};
