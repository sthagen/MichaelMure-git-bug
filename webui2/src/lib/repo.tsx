// Returns the resolved repo ref from the router context.
// Returns null when rendered outside of a /$repo route (e.g. the picker page).
//
// The $repo route's beforeLoad normalizes the slug ("_" → null) and provides
// it as context.ref, so callers don't need to handle the "_" case.

import { useRouteContext } from "@tanstack/react-router";

export function useRepo(): string | null {
  const context = useRouteContext({ strict: false });
  return (context as { ref?: string | null }).ref ?? null;
}
