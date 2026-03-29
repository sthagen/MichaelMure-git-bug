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
