import { createRootRoute, createRoute, createRouter, RouterProvider } from "@tanstack/react-router";

import { Shell } from "@/components/layout/Shell";
import { RepoShell } from "@/lib/repo";
import { BugDetailPage } from "@/pages/BugDetailPage";
import { BugListPage } from "@/pages/BugListPage";
import { CodePage } from "@/pages/CodePage";
import { CommitPage } from "@/pages/CommitPage";
import { ErrorPage } from "@/pages/ErrorPage";
import { IdentitySelectPage } from "@/pages/IdentitySelectPage";
import { NewBugPage } from "@/pages/NewBugPage";
import { RepoPickerPage } from "@/pages/RepoPickerPage";
import { UserProfilePage } from "@/pages/UserProfilePage";

// ── Route tree ───────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: Shell,
  errorComponent: ErrorPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: RepoPickerPage,
});

const authSelectIdentityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/select-identity",
  component: IdentitySelectPage,
});

const repoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$repo",
  component: RepoShell,
});

export type CodePageSearch = {
  ref: string;
  path: string;
  type: "tree" | "blob" | "commits";
};

const repoIndexRoute = createRoute({
  getParentRoute: () => repoRoute,
  path: "/",
  component: CodePage,
  validateSearch: (search: Record<string, unknown>): CodePageSearch => ({
    ref: (search.ref as string) ?? "",
    path: (search.path as string) ?? "",
    type: ["tree", "blob", "commits"].includes(search.type as string)
      ? (search.type as CodePageSearch["type"])
      : "tree",
  }),
});

const bugListRoute = createRoute({
  getParentRoute: () => repoRoute,
  path: "/issues",
  component: BugListPage,
});

const newBugRoute = createRoute({
  getParentRoute: () => repoRoute,
  path: "/issues/new",
  component: NewBugPage,
});

const bugDetailRoute = createRoute({
  getParentRoute: () => repoRoute,
  path: "/issues/$id",
  component: BugDetailPage,
});

const userProfileRoute = createRoute({
  getParentRoute: () => repoRoute,
  path: "/user/$id",
  component: UserProfilePage,
});

const commitRoute = createRoute({
  getParentRoute: () => repoRoute,
  path: "/commit/$hash",
  component: CommitPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authSelectIdentityRoute,
  repoRoute.addChildren([
    repoIndexRoute,
    bugListRoute,
    newBugRoute,
    bugDetailRoute,
    userProfileRoute,
    commitRoute,
  ]),
]);

// ── Router instance ──────────────────────────────────────────────────────────

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return <RouterProvider router={router} />;
}
