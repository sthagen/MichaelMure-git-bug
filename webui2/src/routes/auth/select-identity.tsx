import { createFileRoute } from "@tanstack/react-router";

import { IdentitySelectPage } from "@/pages/IdentitySelectPage";

export const Route = createFileRoute("/auth/select-identity")({
  component: IdentitySelectPage,
});
