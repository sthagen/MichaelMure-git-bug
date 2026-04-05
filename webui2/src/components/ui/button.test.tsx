import { composeStories } from "@storybook/react-vite";
import { render } from "@testing-library/react";
import { expect, test } from "vitest";

import * as stories from "./button.stories";

const composed = composeStories(stories);

for (const [name, Story] of Object.entries(composed)) {
  test(`Button/${name} matches snapshot`, () => {
    const { container } = render(<Story />);
    expect(container.firstChild).toMatchSnapshot();
  });
}
