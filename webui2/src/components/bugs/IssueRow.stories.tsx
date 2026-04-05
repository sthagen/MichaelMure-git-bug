import type { Meta, StoryObj } from "@storybook/react-vite";
import { formatDistanceToNow } from "date-fns";

import { Status } from "@/__generated__/graphql";
import { withRouter } from "@/../.storybook/decorators";

import * as IssueRow from "./IssueRow";
import { LabelBadge } from "./LabelBadge";

const meta = {
  component: IssueRow.Root,
  decorators: [withRouter],
} satisfies Meta<typeof IssueRow.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

const ago = formatDistanceToNow(new Date(Date.now() - 3600 * 1000), { addSuffix: true });

export const OpenIssue: Story = {
  args: { children: null },
  render: () => (
    <IssueRow.Root className="hover:bg-muted/30">
      <IssueRow.StatusIcon status={Status.Open} />
      <div className="min-w-0 flex-1">
        <IssueRow.TitleArea>
          <a href="#" className="text-foreground hover:text-primary font-medium hover:underline">
            Fix login page crash on empty email
          </a>
          <LabelBadge name="bug" color={{ R: 252, G: 41, B: 41 }} />
          <LabelBadge name="priority" color={{ R: 255, G: 152, B: 0 }} />
        </IssueRow.TitleArea>
        <IssueRow.Meta>
          #a1b2c3 opened {ago} by <a href="#" className="hover:underline">Jane Doe</a>
        </IssueRow.Meta>
      </div>
      <IssueRow.CommentCount count={3} />
    </IssueRow.Root>
  ),
};

export const ClosedIssue: Story = {
  args: { children: null },
  render: () => (
    <IssueRow.Root>
      <IssueRow.StatusIcon status={Status.Closed} />
      <div className="min-w-0 flex-1">
        <IssueRow.TitleArea>
          <a href="#" className="text-foreground hover:text-primary font-medium hover:underline">
            Add dark mode support
          </a>
          <LabelBadge name="enhancement" color={{ R: 163, G: 230, B: 53 }} />
        </IssueRow.TitleArea>
        <IssueRow.Meta>#d4e5f6 opened {ago}</IssueRow.Meta>
      </div>
      <IssueRow.CommentCount count={12} />
    </IssueRow.Root>
  ),
};

export const NoLabelsNoComments: Story = {
  args: { children: null },
  render: () => (
    <IssueRow.Root>
      <IssueRow.StatusIcon status={Status.Open} />
      <div className="min-w-0 flex-1">
        <IssueRow.TitleArea>
          <a href="#" className="text-foreground hover:text-primary font-medium hover:underline">
            Simple issue with no labels
          </a>
        </IssueRow.TitleArea>
        <IssueRow.Meta>#abc123 opened {ago} by <a href="#" className="hover:underline">Bob</a></IssueRow.Meta>
      </div>
      <IssueRow.CommentCount count={0} />
    </IssueRow.Root>
  ),
};

export const List: Story = {
  args: { children: null },
  render: () => (
    <div className="border-border rounded-md border">
      <IssueRow.Root className="hover:bg-muted/30">
        <IssueRow.StatusIcon status={Status.Open} />
        <div className="min-w-0 flex-1">
          <IssueRow.TitleArea>
            <a href="#" className="text-foreground hover:text-primary font-medium hover:underline">
              Fix login page crash on empty email
            </a>
            <LabelBadge name="bug" color={{ R: 252, G: 41, B: 41 }} />
          </IssueRow.TitleArea>
          <IssueRow.Meta>#a1b2c3 opened {ago} by Jane Doe</IssueRow.Meta>
        </div>
        <IssueRow.CommentCount count={3} />
      </IssueRow.Root>
      <IssueRow.Root className="hover:bg-muted/30">
        <IssueRow.StatusIcon status={Status.Open} />
        <div className="min-w-0 flex-1">
          <IssueRow.TitleArea>
            <a href="#" className="text-foreground hover:text-primary font-medium hover:underline">
              Add dark mode support
            </a>
            <LabelBadge name="enhancement" color={{ R: 163, G: 230, B: 53 }} />
          </IssueRow.TitleArea>
          <IssueRow.Meta>#d4e5f6 opened {ago} by Bob</IssueRow.Meta>
        </div>
        <IssueRow.CommentCount count={0} />
      </IssueRow.Root>
      <IssueRow.Root className="hover:bg-muted/30">
        <IssueRow.StatusIcon status={Status.Closed} />
        <div className="min-w-0 flex-1">
          <IssueRow.TitleArea>
            <a href="#" className="text-foreground hover:text-primary font-medium hover:underline">
              Update dependencies
            </a>
          </IssueRow.TitleArea>
          <IssueRow.Meta>#g7h8i9 opened {ago} by Alice</IssueRow.Meta>
        </div>
        <IssueRow.CommentCount count={7} />
      </IssueRow.Root>
    </div>
  ),
};
