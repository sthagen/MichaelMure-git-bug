import { composeStories } from "@storybook/react-vite";
import { expect, test } from "vitest";

import * as stories from "./label-badge.stories";

const composed = composeStories(stories);

for (const [name, Story] of Object.entries(composed)) {
  test(`LabelBadge/${name} matches snapshot`, async () => {
    await Story.run();
    expect(document.body.firstChild).toMatchSnapshot();
  });
}
