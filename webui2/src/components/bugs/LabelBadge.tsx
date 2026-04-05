import { createLink, type LinkComponent } from "@tanstack/react-router";
import * as React from "react";

interface LabelBadgeProps {
  name: string;
  color: { R: number; G: number; B: number };
  className?: string;
}

function contrastColor(r: number, g: number, b: number): string {
  // Perceived luminance — pick black or white text for readability
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.9)";
}

// Coloured label pill. Always renders as a <span>.
// Use LabelBadgeLink for a clickable variant that navigates.
const LabelBadge = React.forwardRef<HTMLSpanElement, LabelBadgeProps & Omit<React.HTMLAttributes<HTMLSpanElement>, "color">>(
  ({ name, color, className, ...props }, ref) => {
    const bg = `rgb(${color.R},${color.G},${color.B})`;
    const text = contrastColor(color.R, color.G, color.B);

    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className ?? ""}`}
        style={{ backgroundColor: bg, color: text }}
        {...props}
      >
        {name}
      </span>
    );
  },
);
LabelBadge.displayName = "LabelBadge";

// LabelBadge as a TanStack Router link — renders as <a> with label styling.
const CreatedLabelBadgeLink = createLink(
  React.forwardRef<HTMLAnchorElement, LabelBadgeProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color">>(
    ({ name, color, className, ...props }, ref) => {
      const bg = `rgb(${color.R},${color.G},${color.B})`;
      const text = contrastColor(color.R, color.G, color.B);

      return (
        <a
          ref={ref}
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium hover:opacity-80 ${className ?? ""}`}
          style={{ backgroundColor: bg, color: text }}
          {...props}
        >
          {name}
        </a>
      );
    },
  ),
);

const LabelBadgeLink: LinkComponent<typeof CreatedLabelBadgeLink> = (props) => {
  return <CreatedLabelBadgeLink preload="intent" {...props} />;
};

export { LabelBadge, LabelBadgeLink };
