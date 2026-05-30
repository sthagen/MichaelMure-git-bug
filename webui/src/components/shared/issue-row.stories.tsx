import type { Meta, StoryObj } from "@storybook/react-vite";
import { formatDistanceToNow } from "date-fns";

import { withApollo, withCachedFragments, withRouter } from "@/../.storybook/decorators";
import { makeFragmentData } from "@/__generated__/fragment-masking";
import type { BugSummaryFragment } from "@/__generated__/graphql";
import { Status } from "@/__generated__/graphql";

import * as IssueRow from "./issue-row";
import { LabelBadge, LABEL_FIELDS_FRAGMENT } from "./label-badge";

const bugLabel = { __typename: "Label" as const, name: "bug", color: { R: 252, G: 41, B: 41 } };
const priorityLabel = {
  __typename: "Label" as const,
  name: "priority",
  color: { R: 255, G: 152, B: 0 },
};
const enhancementLabel = {
  __typename: "Label" as const,
  name: "enhancement",
  color: { R: 163, G: 230, B: 53 },
};

const allLabelsData = [bugLabel, priorityLabel, enhancementLabel];

// Mock data shaped like BugSummaryFragment from GraphQL
const openBug: BugSummaryFragment = {
  id: "abc123",
  humanId: "a1b2c3",
  status: Status.Open,
  title: "Fix login page crash on empty email",
  labels: [
    makeFragmentData(bugLabel, LABEL_FIELDS_FRAGMENT),
    makeFragmentData(priorityLabel, LABEL_FIELDS_FRAGMENT),
  ],
  author: {
    __typename: "Identity",
    id: "u1",
    humanId: "user1",
    displayName: "Jane Doe",
    avatarUrl: null,
  },
  createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  comments: { totalCount: 3 },
};

const closedBug: BugSummaryFragment = {
  id: "def456",
  humanId: "d4e5f6",
  status: Status.Closed,
  title: "Add dark mode support",
  labels: [makeFragmentData(enhancementLabel, LABEL_FIELDS_FRAGMENT)],
  author: {
    __typename: "Identity",
    id: "u2",
    humanId: "user2",
    displayName: "Bob Smith",
    avatarUrl: null,
  },
  createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
  comments: { totalCount: 12 },
};

const noLabelsBug: BugSummaryFragment = {
  id: "ghi789",
  humanId: "g7h8i9",
  status: Status.Open,
  title: "Simple issue with no labels",
  labels: [],
  author: {
    __typename: "Identity",
    id: "u3",
    humanId: "user3",
    displayName: "Alice Wu",
    avatarUrl: null,
  },
  createdAt: new Date(Date.now() - 7200 * 1000).toISOString(),
  comments: { totalCount: 0 },
};

const meta = {
  component: IssueRow.Root,
  decorators: [
    withRouter,
    withApollo,
    withCachedFragments(
      ...allLabelsData.map((l) => [LABEL_FIELDS_FRAGMENT, "LabelFields", l] as const),
    ),
  ],
} satisfies Meta<typeof IssueRow.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

function BugRow({ bug }: { bug: BugSummaryFragment }) {
  const ago = formatDistanceToNow(new Date(bug.createdAt), { addSuffix: true });
  return (
    <IssueRow.Root className="hover:bg-muted/30">
      <IssueRow.StatusIcon status={bug.status} />
      <div className="min-w-0 flex-1">
        <IssueRow.TitleArea>
          <a href="#" className="text-foreground hover:text-primary font-medium hover:underline">
            {bug.title}
          </a>
          {bug.labels.map((l) => (
            <LabelBadge key={l.name} label={l} />
          ))}
        </IssueRow.TitleArea>
        <IssueRow.Meta>
          #{bug.humanId} opened {ago} by{" "}
          <a href="#" className="hover:underline">
            {bug.author.displayName}
          </a>
        </IssueRow.Meta>
      </div>
      <IssueRow.CommentCount count={bug.comments.totalCount} />
    </IssueRow.Root>
  );
}

export const OpenIssue: Story = {
  parameters: { a11y: { disable: true } },
  args: { children: null },
  render: () => <BugRow bug={openBug} />,
};

export const ClosedIssue: Story = {
  args: { children: null },
  render: () => <BugRow bug={closedBug} />,
};

export const NoLabelsNoComments: Story = {
  args: { children: null },
  render: () => <BugRow bug={noLabelsBug} />,
};

export const List: Story = {
  parameters: { a11y: { disable: true } },
  args: { children: null },
  render: () => (
    <div className="border-border rounded-md border">
      <BugRow bug={openBug} />
      <BugRow bug={closedBug} />
      <BugRow bug={noLabelsBug} />
    </div>
  ),
};
