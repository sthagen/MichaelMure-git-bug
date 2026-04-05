import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import type { Decorator } from "@storybook/react-vite";

// Catch-all route so any <Link to="..."> resolves without errors.
const rootRoute = createRootRoute();
const catchAll = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
});
rootRoute.addChildren([catchAll]);

const router = createRouter({
  routeTree: rootRoute,
  history: createMemoryHistory({ initialEntries: ["/"] }),
});

// Wraps a story in a TanStack Router context so components using <Link> render.
export const withRouter: Decorator = (Story) => (
  <RouterProvider router={router} defaultComponent={() => <Story />} />
);
