import { composeStories } from "@storybook/react-vite";
import { beforeAll, expect, test } from "vitest";

import { getHighlighter } from "@/lib/shiki";

import * as stories from "./file-content.stories";

// Pre-load shiki so the singleton promise is already resolved when
// the component's useEffect runs.
beforeAll(async () => {
  await getHighlighter();
});

const composed = composeStories(stories);

for (const [name, Story] of Object.entries(composed)) {
  test(`FileContent/${name} matches snapshot`, async () => {
    await Story.run();
    expect(document.body.firstChild).toMatchSnapshot();
  });
}
