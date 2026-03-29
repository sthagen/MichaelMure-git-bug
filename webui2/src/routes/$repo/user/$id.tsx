import { createFileRoute } from "@tanstack/react-router";

import { UserProfilePage } from "@/pages/UserProfilePage";

export const Route = createFileRoute("/$repo/user/$id")({
  component: UserProfilePage,
});
