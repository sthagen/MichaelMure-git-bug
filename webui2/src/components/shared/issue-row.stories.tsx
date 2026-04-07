import type { Meta, StoryObj } from "@storybook/react-vite";
import { formatDistanceToNow } from "date-fns";

import type { BugSummaryFragment } from "@/__generated__/graphql";
import { Status } from "@/__generated__/graphql";
import { withRouter } from "@/../.storybook/decorators";

import * as IssueRow from "./issue-row";
import { LabelBadge } from "./label-badge";

const meta = {
  component: IssueRow.Root,
  decorators: [withRouter],
} satisfies Meta<typeof IssueRow.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data shaped like BugSummaryFragment from GraphQL
const openBug: BugSummaryFragment = {
  id: "abc123",
  humanId: "a1b2c3",
  status: Status.Open,
  title: "Fix login page crash on empty email",
  labels: [
    { name: "bug", color: { R: 252, G: 41, B: 41 } },
    { name: "priority", color: { R: 255, G: 152, B: 0 } },
  ],
  author: { id: "u1", humanId: "user1", displayName: "Jane Doe", avatarUrl: null },
  createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  comments: { totalCount: 3 },
};

const closedBug: BugSummaryFragment = {
  id: "def456",
  humanId: "d4e5f6",
  status: Status.Closed,
  title: "Add dark mode support",
  labels: [{ name: "enhancement", color: { R: 163, G: 230, B: 53 } }],
  author: { id: "u2", humanId: "user2", displayName: "Bob Smith", avatarUrl: null },
  createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
  comments: { totalCount: 12 },
};

const noLabelsBug: BugSummaryFragment = {
  id: "ghi789",
  humanId: "g7h8i9",
  status: Status.Open,
  title: "Simple issue with no labels",
  labels: [],
  author: { id: "u3", humanId: "user3", displayName: "Alice Wu", avatarUrl: null },
  createdAt: new Date(Date.now() - 7200 * 1000).toISOString(),
  comments: { totalCount: 0 },
};

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
            <LabelBadge key={l.name} {...l} />
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
