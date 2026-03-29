import { createFileRoute } from "@tanstack/react-router";

import { RepoPickerPage } from "@/pages/RepoPickerPage";

export const Route = createFileRoute("/")({
  component: RepoPickerPage,
});
