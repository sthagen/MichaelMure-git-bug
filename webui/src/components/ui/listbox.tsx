// Pure presentational compound components for listbox/dropdown menus.
// No floating-ui logic — consumers wire hooks directly and pass refs/props.
// Each component forwards refs and spreads extra props for getFloatingProps, getItemProps, etc.

import { Check, Search } from "lucide-react";
import { forwardRef, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

// ── Content ──────────────────────────────────────────────────────────────────

const Content = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-50 flex w-56 flex-col overflow-hidden rounded-md bg-popover text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden",
        className,
      )}
      {...props}
    />
  ),
);
Content.displayName = "Listbox.Content";

// ── ScrollArea ───────────────────────────────────────────────────────────────

const ScrollArea = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("max-h-64 overflow-y-auto p-1", className)}
      {...props}
    />
  ),
);
ScrollArea.displayName = "Listbox.ScrollArea";

// ── Search ───────────────────────────────────────────────────────────────────

const SearchInput = forwardRef<
  HTMLInputElement,
  ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <div className="border-border flex items-center gap-2 border-b px-3 py-2">
    <Search className="text-muted-foreground size-3.5 shrink-0" />
    <input
      ref={ref}
      type="text"
      autoFocus
      className={cn(
        "placeholder:text-muted-foreground w-full bg-transparent text-sm outline-hidden",
        className,
      )}
      {...props}
    />
  </div>
));
SearchInput.displayName = "Listbox.Search";

// ── Group ────────────────────────────────────────────────────────────────────

function Group({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mb-1", className)} {...props} />;
}

// ── GroupLabel ────────────────────────────────────────────────────────────────

function GroupLabel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("text-muted-foreground px-2 py-1 text-xs", className)}
      {...props}
    />
  );
}

// ── Item ─────────────────────────────────────────────────────────────────────

interface ItemProps extends ComponentProps<"button"> {
  /** Keyboard-highlighted (arrow key navigation). */
  active?: boolean;
  /** Currently selected / checked. */
  selected?: boolean;
}

const Item = forwardRef<HTMLButtonElement, ItemProps>(
  ({ active, selected, className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="option"
      aria-selected={selected}
      data-active={active || undefined}
      className={cn(
        "flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none",
        active ? "bg-accent text-accent-foreground" : "hover:bg-muted",
        className,
      )}
      {...props}
    >
      {children}
      {selected && <Check className="text-foreground ml-auto size-3.5 shrink-0" />}
    </button>
  ),
);
Item.displayName = "Listbox.Item";

// ── Empty ────────────────────────────────────────────────────────────────────

function Empty({ className, children = "No results", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("text-muted-foreground px-2 py-3 text-center text-xs", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────

function Footer({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("border-border border-t p-1", className)} {...props} />;
}

// ── FooterButton ─────────────────────────────────────────────────────────────

function FooterButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "text-muted-foreground hover:bg-muted flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs",
        className,
      )}
      {...props}
    />
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export { Content, ScrollArea, SearchInput as Search, Group, GroupLabel, Item, Empty, Footer, FooterButton };
