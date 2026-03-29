import { createFileRoute } from "@tanstack/react-router";

import { RepoShell } from "@/lib/repo";

export const Route = createFileRoute("/$repo")({
  component: RepoShell,
});
