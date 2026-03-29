import { createFileRoute } from "@tanstack/react-router";

import { BugDetailPage } from "@/pages/BugDetailPage";

export const Route = createFileRoute("/$repo/issues/$id")({
  component: BugDetailPage,
});
