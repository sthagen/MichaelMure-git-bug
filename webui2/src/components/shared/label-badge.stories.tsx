import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { makeFragmentData } from "@/__generated__/fragment-masking";
import { withApollo, withCachedFragments } from "@/../.storybook/decorators";

import { LabelBadge, LABEL_FIELDS_FRAGMENT } from "./label-badge";

const bugData = { __typename: "Label" as const, name: "bug", color: { R: 252, G: 41, B: 41 } };
const enhancementData = { __typename: "Label" as const, name: "enhancement", color: { R: 163, G: 230, B: 53 } };
const documentationData = { __typename: "Label" as const, name: "documentation", color: { R: 30, G: 80, B: 160 } };
const helpWantedData = { __typename: "Label" as const, name: "help wanted", color: { R: 0, G: 150, B: 136 } };
const wontfixData = { __typename: "Label" as const, name: "wontfix", color: { R: 200, G: 200, B: 200 } };
const priorityData = { __typename: "Label" as const, name: "priority", color: { R: 255, G: 152, B: 0 } };

const allLabelsData = [bugData, enhancementData, documentationData, helpWantedData, wontfixData, priorityData];

const bug = makeFragmentData(bugData, LABEL_FIELDS_FRAGMENT);
const enhancement = makeFragmentData(enhancementData, LABEL_FIELDS_FRAGMENT);
const documentation = makeFragmentData(documentationData, LABEL_FIELDS_FRAGMENT);
const helpWanted = makeFragmentData(helpWantedData, LABEL_FIELDS_FRAGMENT);
const wontfix = makeFragmentData(wontfixData, LABEL_FIELDS_FRAGMENT);
const priority = makeFragmentData(priorityData, LABEL_FIELDS_FRAGMENT);

const allLabels = [bug, enhancement, documentation, helpWanted, wontfix, priority];

const meta = {
  component: LabelBadge,
  decorators: [
    withApollo,
    withCachedFragments(
      ...allLabelsData.map((l) => [LABEL_FIELDS_FRAGMENT, "LabelFields", l] as const),
    ),
  ],
} satisfies Meta<typeof LabelBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { a11y: { disable: true } },
  args: { label: bug },
};

export const LightBackground: Story = {
  args: { label: enhancement },
};

export const DarkBackground: Story = {
  args: { label: documentation },
};

export const Clickable: Story = {
  parameters: { a11y: { disable: true } },
  args: { label: helpWanted, onClick: fn() },
};

export const AllColors: Story = {
  parameters: { a11y: { disable: true } },
  args: { label: bug },
  render: () => (
    <div className="flex flex-wrap gap-2">
      {allLabelsData.map((data, i) => (
        <LabelBadge key={data.name} label={allLabels[i]!} />
      ))}
    </div>
  ),
};
