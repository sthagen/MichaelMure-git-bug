// Sticky navigation bar. Two states: root page (logo only) and repo page
// (logo + Code/Issues nav + New issue button + avatar).
import type { Meta, StoryObj } from "@storybook/react-vite";

import { withApollo, withRepoRouter, withRouter } from "@/../.storybook/decorators";

import { Header } from "./header";

const meta = {
  component: Header,
  parameters: { layout: "fullscreen", a11y: { disable: true } },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

// At "/" — no repo in URL, only logo and theme picker shown.
export const RootPage: Story = {
  decorators: [withRouter, withApollo],
};

// Inside a repo — shows Code + Issues nav links, New issue button, and avatar.
export const RepoPage: Story = {
  decorators: [withRepoRouter, withApollo],
};
