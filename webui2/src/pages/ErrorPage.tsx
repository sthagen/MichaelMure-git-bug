// Global error boundary page. Rendered by TanStack Router when a route throws.

import { useRouter } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

export function ErrorPage({ error }: { error?: Error }) {
  const router = useRouter();

  const message = error?.message ?? "An unexpected error occurred.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="text-muted-foreground size-10" />
      <p className="text-muted-foreground text-sm">{message}</p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void router.invalidate();
          }}
        >
          Try again
        </Button>
        <ButtonLink to="/" variant="outline" size="sm">
          Go home
        </ButtonLink>
      </div>
    </div>
  );
}
