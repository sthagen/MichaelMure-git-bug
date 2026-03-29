import { createFileRoute } from "@tanstack/react-router";

import { CodePage } from "@/pages/CodePage";

export type CodePageSearch = {
  ref: string;
  path: string;
  type: "tree" | "blob" | "commits";
};

export const Route = createFileRoute("/$repo/")({
  component: CodePage,
  validateSearch: (search: Record<string, unknown>): CodePageSearch => ({
    ref: (search.ref as string) ?? "",
    path: (search.path as string) ?? "",
    type: ["tree", "blob", "commits"].includes(search.type as string)
      ? (search.type as CodePageSearch["type"])
      : "tree",
  }),
});
