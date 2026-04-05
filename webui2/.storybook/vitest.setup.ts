import { setProjectAnnotations } from "@storybook/react-vite";
import { beforeAll } from "vitest";

import * as previewAnnotations from "./preview";

// Apply Storybook decorators/parameters from preview.ts to portable stories
// used by the snapshot test project.
const annotations = setProjectAnnotations([previewAnnotations]);

beforeAll(annotations.beforeAll);
