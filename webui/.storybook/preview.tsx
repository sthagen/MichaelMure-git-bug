import type { Preview } from "@storybook/react-vite";

import "../src/index.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Toggle light/dark mode",
      toolbar: {
        title: "Theme",
        icon: "sun",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as string;
      document.documentElement.classList.toggle("dark", theme === "dark");
      return <Story />;
    },
  ],
  parameters: {
    a11y: {
      test: "error",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
  },
};

export default preview;
