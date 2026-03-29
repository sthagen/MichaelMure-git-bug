import { createRootRoute } from "@tanstack/react-router";

import { Shell } from "@/components/layout/Shell";
import { ErrorPage } from "@/pages/ErrorPage";

export const Route = createRootRoute({
  component: Shell,
  errorComponent: ErrorPage,
});
