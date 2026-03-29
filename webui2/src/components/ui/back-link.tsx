import { Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

// A "Back to ..." link that uses browser history when available,
// falling back to a typed Link destination otherwise.
// This preserves scroll position and filter state when navigating
// back from a detail page to a list.
export function BackLink({
  children,
  ...fallbackProps
}: LinkProps & { children: React.ReactNode }) {
  const canGoBack = useCanGoBack();
  const router = useRouter();

  if (canGoBack) {
    return (
      <button
        onClick={() => router.history.back()}
        className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-3.5" />
        {children}
      </button>
    );
  }

  return (
    <Link
      {...fallbackProps}
      className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1.5 text-sm"
    >
      <ArrowLeft className="size-3.5" />
      {children}
    </Link>
  );
}
