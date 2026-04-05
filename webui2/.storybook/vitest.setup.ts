import { setProjectAnnotations } from "@storybook/react-vite";
import { beforeAll } from "vitest";

import * as previewAnnotations from "./preview";

// Apply Storybook decorators/parameters from preview.ts to portable stories.
// Note: the @storybook/addon-vitest project handles this automatically;
// this setup file is only used by the snapshot test project.
const annotations = setProjectAnnotations([previewAnnotations]);

beforeAll(annotations.beforeAll);
