import { createLink, type LinkComponent } from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

import { buttonVariants } from "./button";

// A proper TanStack Router link that looks like a Button.
// Replaces the `<Button asChild><Link …/></Button>` pattern,
// giving us preloading, typed routes, and active link support.
interface ButtonLinkProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  children?: React.ReactNode;
}

const ButtonLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  ButtonLinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, variant, size, children, ...props }, ref) => {
  return (
    <a ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </a>
  );
});
ButtonLinkComponent.displayName = "ButtonLinkComponent";

const CreatedButtonLink = createLink(ButtonLinkComponent);

export const ButtonLink: LinkComponent<typeof ButtonLinkComponent> = (props) => {
  return <CreatedButtonLink preload="intent" {...props} />;
};

// A nav link that uses activeProps/inactiveProps for styling.
// Replaces the manual useMatchRoute() pattern in the header.
const NavLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ children, ...props }, ref) => {
  return (
    <a ref={ref} {...props}>
      {children}
    </a>
  );
});
NavLinkComponent.displayName = "NavLinkComponent";

const CreatedNavLink = createLink(NavLinkComponent);

export const NavLink: LinkComponent<typeof NavLinkComponent> = (props) => {
  return (
    <CreatedNavLink
      preload="intent"
      className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
      activeProps={{ className: "bg-accent text-accent-foreground" }}
      inactiveProps={{
        className: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      }}
      {...props}
    />
  );
};
