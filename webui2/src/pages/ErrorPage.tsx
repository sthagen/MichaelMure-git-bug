// Global error boundary page. Rendered by React Router when a route throws
// or when navigation results in a 404. Replaces the default "Unexpected
// Application Error!" screen.

import { AlertTriangle } from "lucide-react";
import { useRouteError, isRouteErrorResponse, Link } from "react-router";

import { Button } from "@/components/ui/button";

export function ErrorPage() {
  const error = useRouteError();

  let status: number | undefined;
  let message: string;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = error.statusText || error.data;
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = "An unexpected error occurred.";
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="text-muted-foreground size-10" />
      {status && <p className="text-5xl font-bold tracking-tight">{status}</p>}
      <p className="text-muted-foreground text-sm">{message}</p>
      <Button variant="outline" size="sm" asChild>
        <Link to="/">Go home</Link>
      </Button>
    </div>
  );
}
