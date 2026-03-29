import { createFileRoute } from "@tanstack/react-router";

import { CommitPage } from "@/pages/CommitPage";

export const Route = createFileRoute("/$repo/commit/$hash")({
  component: CommitPage,
});
