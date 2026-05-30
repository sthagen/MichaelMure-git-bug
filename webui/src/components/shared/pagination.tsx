import { createLink, type LinkComponent } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { buttonVariants } from "@/components/ui/button";

interface RootProps {
  children: React.ReactNode;
  className?: string;
}

export function Root({ children, className }: RootProps) {
  return (
    <div
      className={cn(
        "border-border flex items-center justify-center gap-2 border-t px-4 py-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface InfoProps {
  children: React.ReactNode;
}

export function Info({ children }: InfoProps) {
  return <span className="text-muted-foreground text-sm">{children}</span>;
}

// Previous/Next are createLink-wrapped so they work as router links.
const PreviousComponent = React.forwardRef<
  HTMLAnchorElement,
  { className?: string; children?: React.ReactNode; disabled?: boolean } & React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, children, disabled, ...props }, ref) => (
  <a
    ref={ref}
    aria-disabled={disabled || undefined}
    tabIndex={disabled ? -1 : undefined}
    className={cn(
      buttonVariants({ variant: "ghost", size: "sm" }),
      "text-muted-foreground gap-1",
      disabled && "pointer-events-none opacity-50",
      className,
    )}
    {...props}
  >
    <ChevronLeft className="size-4" />
    {children ?? "Previous"}
  </a>
));
PreviousComponent.displayName = "PreviousComponent";

const CreatedPrevious = createLink(PreviousComponent);
export const Previous: LinkComponent<typeof PreviousComponent> = (props) => (
  <CreatedPrevious preload="intent" {...props} />
);

const NextComponent = React.forwardRef<
  HTMLAnchorElement,
  { className?: string; children?: React.ReactNode; disabled?: boolean } & React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, children, disabled, ...props }, ref) => (
  <a
    ref={ref}
    aria-disabled={disabled || undefined}
    tabIndex={disabled ? -1 : undefined}
    className={cn(
      buttonVariants({ variant: "ghost", size: "sm" }),
      "text-muted-foreground gap-1",
      disabled && "pointer-events-none opacity-50",
      className,
    )}
    {...props}
  >
    {children ?? "Next"}
    <ChevronRight className="size-4" />
  </a>
));
NextComponent.displayName = "NextComponent";

const CreatedNext = createLink(NextComponent);
export const Next: LinkComponent<typeof NextComponent> = (props) => (
  <CreatedNext preload="intent" {...props} />
);
