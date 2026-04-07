import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { useState } from "react";

import type { SortValue } from "@/lib/query-utils";

import { IssueFilters, type LabelItem, type IdentityItem } from "./issue-filters";

const meta = {
  component: IssueFilters,
  parameters: { layout: "centered", a11y: { disable: true } },
} satisfies Meta<typeof IssueFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleLabels: LabelItem[] = [
  { name: "bug", color: { R: 252, G: 41, B: 41 } },
  { name: "enhancement", color: { R: 0, G: 150, B: 255 } },
  { name: "documentation", color: { R: 0, G: 180, B: 80 } },
  { name: "help wanted", color: { R: 255, G: 152, B: 0 } },
  { name: "good first issue", color: { R: 124, G: 58, B: 237 } },
  { name: "duplicate", color: { R: 120, G: 120, B: 120 } },
  { name: "wontfix", color: { R: 180, G: 180, B: 180 } },
];

const sampleIdentities: IdentityItem[] = [
  { id: "u1", humanId: "abc1", displayName: "Jane Doe", login: "janedoe", name: "Jane Doe", email: "jane@example.com", avatarUrl: null },
  { id: "u2", humanId: "abc2", displayName: "John Smith", login: "jsmith", name: "John Smith", email: "john@example.com", avatarUrl: null },
  { id: "u3", humanId: "abc3", displayName: "Alice Wonder", login: "alice", name: "Alice Wonder", email: "alice@example.com", avatarUrl: null },
  { id: "u4", humanId: "abc4", displayName: "Bob Builder", login: "bob", name: "Bob Builder", email: "bob@example.com", avatarUrl: null },
  { id: "u5", humanId: "abc5", displayName: "Carol Tester", login: "carol", name: "Carol Tester", email: "carol@example.com", avatarUrl: null },
];

export const Default: Story = {
  args: {
    labels: sampleLabels,
    identities: sampleIdentities,
    selectedLabels: [],
    onLabelsChange: fn(),
    selectedAuthorId: null,
    onAuthorChange: fn(),
    recentAuthorIds: ["abc1", "abc3"],
    sort: "creation-desc",
    onSortChange: fn(),
  },
};

export const WithSelections: Story = {
  args: {
    labels: sampleLabels,
    identities: sampleIdentities,
    selectedLabels: ["bug", "enhancement"],
    onLabelsChange: fn(),
    selectedAuthorId: "abc2",
    onAuthorChange: fn(),
    recentAuthorIds: ["abc1", "abc2"],
    sort: "edit-desc",
    onSortChange: fn(),
  },
};

// Interactive story with working state
function Interactive() {
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortValue>("creation-desc");

  return (
    <div className="flex flex-col items-start gap-4">
      <IssueFilters
        labels={sampleLabels}
        identities={sampleIdentities}
        selectedLabels={selectedLabels}
        onLabelsChange={setSelectedLabels}
        selectedAuthorId={selectedAuthorId}
        onAuthorChange={(id) => setSelectedAuthorId(id)}
        recentAuthorIds={["abc1", "abc3"]}
        sort={sort}
        onSortChange={setSort}
      />
      <div className="text-muted-foreground text-xs">
        Labels: {selectedLabels.join(", ") || "none"} · Author: {selectedAuthorId ?? "none"} · Sort: {sort}
      </div>
    </div>
  );
}

export const InteractiveState: Story = {
  render: () => <Interactive />,
};
