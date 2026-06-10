import { composeStories } from "@storybook/react-vite";
import { expect, test } from "vitest";

import * as stories from "./button-link.stories";

const composed = composeStories(stories);

for (const [name, Story] of Object.entries(composed)) {
  test(`ButtonLink/${name} matches snapshot`, async () => {
    await Story.run();
    expect(document.body.firstChild).toMatchSnapshot();
  });
}
