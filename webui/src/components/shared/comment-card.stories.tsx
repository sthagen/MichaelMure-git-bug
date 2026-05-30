import type { Meta, StoryObj } from "@storybook/react-vite";

import { withApollo, withCachedFragments } from "@/../.storybook/decorators";
import { makeFragmentData } from "@/__generated__/fragment-masking";

import * as CommentCard from "./comment-card";
import { IDENTITY_SUMMARY_FRAGMENT } from "./comment-card";

const janeData = {
  __typename: "Identity" as const,
  id: "1",
  humanId: "jane1",
  displayName: "Jane Doe",
  avatarUrl: null,
};

const bobData = {
  __typename: "Identity" as const,
  id: "2",
  humanId: "bob1",
  displayName: "Bob Smith",
  avatarUrl: "https://github.com/shadcn.png",
};

const aliceData = {
  __typename: "Identity" as const,
  id: "3",
  humanId: "alice1",
  displayName: "Alice Wu",
  avatarUrl: null,
};

const jane = makeFragmentData(janeData, IDENTITY_SUMMARY_FRAGMENT);
const bob = makeFragmentData(bobData, IDENTITY_SUMMARY_FRAGMENT);
const alice = makeFragmentData(aliceData, IDENTITY_SUMMARY_FRAGMENT);

const meta = {
  component: CommentCard.Root,
  decorators: [
    withApollo,
    withCachedFragments(
      [IDENTITY_SUMMARY_FRAGMENT, "IdentitySummary", janeData],
      [IDENTITY_SUMMARY_FRAGMENT, "IdentitySummary", bobData],
      [IDENTITY_SUMMARY_FRAGMENT, "IdentitySummary", aliceData],
    ),
  ],
  parameters: { a11y: { disable: true } },
} satisfies Meta<typeof CommentCard.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: () => (
    <CommentCard.Root>
      <CommentCard.AuthorAvatar author={jane} />
      <CommentCard.Card>
        <CommentCard.CardHeader>
          <span className="text-foreground font-medium">{janeData.displayName}</span>
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
      <CommentCard.AuthorAvatar author={bob} />
      <CommentCard.Card>
        <CommentCard.CardHeader>
          <span className="text-foreground font-medium">{bobData.displayName}</span>
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
      <CommentCard.AuthorAvatar author={alice} />
      <CommentCard.Card>
        <CommentCard.CardHeader>
          <span className="text-foreground font-medium">{aliceData.displayName}</span>
          <span className="text-muted-foreground">just now</span>
        </CommentCard.CardHeader>
        <CommentCard.CardBody>
          <p className="text-muted-foreground text-sm italic">No description provided.</p>
        </CommentCard.CardBody>
      </CommentCard.Card>
    </CommentCard.Root>
  ),
};
