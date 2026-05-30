import { createLink, type LinkComponent } from "@tanstack/react-router";
import { CircleDot, CircleCheck } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface RootProps {
  children: React.ReactNode;
  className?: string;
}

export function Root({ children, className }: RootProps) {
  return <div className={cn("flex items-center gap-1", className)}>{children}</div>;
}

// Tab is a createLink-wrapped component — it IS the link.
const TabComponent = React.forwardRef<
  HTMLAnchorElement,
  { className?: string; children?: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, children, ...props }, ref) => {
  return (
    <a
      ref={ref}
      className={cn(
        "text-muted-foreground hover:bg-accent/50 hover:text-foreground flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
});
TabComponent.displayName = "TabComponent";

const CreatedTab = createLink(TabComponent);

export const Tab: LinkComponent<typeof TabComponent> = (props) => {
  return (
    <CreatedTab
      preload="intent"
      activeProps={{ className: "bg-accent text-accent-foreground" }}
      {...props}
    />
  );
};

interface IndicatorProps {
  active?: boolean;
  className?: string;
}

export function OpenIndicator({ active, className }: IndicatorProps) {
  return (
    <CircleDot
      className={cn("size-4", active && "text-green-600 dark:text-green-400", className)}
    />
  );
}

export function ClosedIndicator({ active, className }: IndicatorProps) {
  return (
    <CircleCheck
      className={cn("size-4", active && "text-purple-600 dark:text-purple-400", className)}
    />
  );
}

interface CountProps {
  children: React.ReactNode;
}

export function Count({ children }: CountProps) {
  return (
    <span className="bg-muted ml-0.5 rounded-full px-1.5 py-0.5 text-xs leading-none tabular-nums">
      {children}
    </span>
  );
}
