import { composeStories } from "@storybook/react-vite";
import { expect, test } from "vitest";

import * as stories from "./empty-state.stories";

const composed = composeStories(stories);

for (const [name, Story] of Object.entries(composed)) {
  test(`EmptyState/${name} matches snapshot`, async () => {
    await Story.run();
    expect(document.body.firstChild).toMatchSnapshot();
  });
}
