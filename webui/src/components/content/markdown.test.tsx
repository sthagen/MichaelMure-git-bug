import { composeStories } from "@storybook/react-vite";
import { beforeAll, expect, test } from "vitest";

import { getHighlighter } from "@/lib/shiki";

import * as stories from "./markdown.stories";

// Pre-load shiki so the singleton promise is already resolved when
// useShikiHighlighter() runs inside the component.
beforeAll(async () => {
  await getHighlighter();
});

const composed = composeStories(stories);

for (const [name, Story] of Object.entries(composed)) {
  test(`Markdown/${name} matches snapshot`, async () => {
    await Story.run();
    expect(document.body.firstChild).toMatchSnapshot();
  });
}
