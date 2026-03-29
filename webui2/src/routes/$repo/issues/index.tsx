import { createFileRoute } from "@tanstack/react-router";

import { BugListPage } from "@/pages/BugListPage";

export const Route = createFileRoute("/$repo/issues/")({
  component: BugListPage,
});
