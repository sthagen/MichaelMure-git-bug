// Shared Shiki highlighter singleton.
// Used by both FileViewer (codeToHast) and Markdown (rehype plugin).

import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

let highlighterPromise: Promise<HighlighterCore> | null = null;

export function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        import("@shikijs/themes/github-light"),
        import("@shikijs/themes/github-dark"),
      ],
      // Pre-load common languages for Markdown code blocks.
      // FileViewer also loads additional languages on demand via loadLanguage().
      langs: [
        import("@shikijs/langs/javascript"),
        import("@shikijs/langs/typescript"),
        import("@shikijs/langs/jsx"),
        import("@shikijs/langs/tsx"),
        import("@shikijs/langs/json"),
        import("@shikijs/langs/html"),
        import("@shikijs/langs/css"),
        import("@shikijs/langs/bash"),
        import("@shikijs/langs/go"),
        import("@shikijs/langs/yaml"),
        import("@shikijs/langs/markdown"),
        import("@shikijs/langs/python"),
        import("@shikijs/langs/rust"),
        import("@shikijs/langs/sql"),
        import("@shikijs/langs/graphql"),
        import("@shikijs/langs/diff"),
      ],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}

export const SHIKI_THEMES = { light: "github-light", dark: "github-dark" } as const;
