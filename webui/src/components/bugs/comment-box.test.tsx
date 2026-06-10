import { composeStories } from "@storybook/react-vite";
import { expect, test } from "vitest";

import * as stories from "./comment-box.stories";

const composed = composeStories(stories);

for (const [name, Story] of Object.entries(composed)) {
  test(`CommentBox/${name} matches snapshot`, async () => {
    await Story.run();
    expect(document.body.firstChild).toMatchSnapshot();
  });
}
