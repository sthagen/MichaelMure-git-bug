import { createFileRoute } from "@tanstack/react-router";

import { NewBugPage } from "@/pages/NewBugPage";

export const Route = createFileRoute("/$repo/issues/new")({
  component: NewBugPage,
});
