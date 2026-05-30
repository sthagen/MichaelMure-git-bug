import { composeStories } from "@storybook/react-vite";
import { expect, test } from "vitest";

import * as stories from "./textarea.stories";

const composed = composeStories(stories);

for (const [name, Story] of Object.entries(composed)) {
  test(`Textarea/${name} matches snapshot`, async () => {
    await Story.run();
    expect(document.body.firstChild).toMatchSnapshot();
  });
}
