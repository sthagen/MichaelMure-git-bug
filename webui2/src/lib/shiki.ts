// Shared Shiki highlighter singleton.
// Used by both FileViewer (codeToHast) and Markdown (rehype plugin).

import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

let highlighterPromise: Promise<HighlighterCore> | null = null;

export function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        import("@shikijs/themes/github-light"),
        import("@shikijs/themes/github-dark"),
      ],
      langs: [],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    });
  }
  return highlighterPromise;
}

export const SHIKI_THEMES = { light: "github-light", dark: "github-dark" } as const;
