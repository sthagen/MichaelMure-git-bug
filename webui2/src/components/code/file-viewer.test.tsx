import { composeStories } from "@storybook/react-vite";
import { act } from "react";
import { expect, test } from "vitest";

import { getHighlighter } from "@/lib/shiki";

import * as stories from "./file-viewer.stories";

const composed = composeStories(stories);

for (const [name, Story] of Object.entries(composed)) {
  test(`FileViewer/${name} matches snapshot`, async () => {
    await Story.run();
    // Flush the async shiki highlighter so syntax-highlighted
    // content is included deterministically in the snapshot.
    await act(async () => {
      await getHighlighter();
    });
    expect(document.body.firstChild).toMatchSnapshot();
  });
}
