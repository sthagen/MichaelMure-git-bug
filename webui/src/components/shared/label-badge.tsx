import { useFragment, type FragmentType } from "@/__generated__/fragment-masking";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import * as React from "react";

import { graphql } from "@/__generated__/gql";

export const LABEL_FIELDS_FRAGMENT = graphql(`
  fragment LabelFields on Label {
    name
    color {
      R
      G
      B
    }
  }
`);

function contrastColor(r: number, g: number, b: number): string {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.9)";
}

interface LabelBadgeProps {
  label: FragmentType<typeof LABEL_FIELDS_FRAGMENT>;
  className?: string;
}

// Coloured label pill. Always renders as a <span>.
// Use LabelBadgeLink for a clickable variant that navigates.
const LabelBadge = React.forwardRef<
  HTMLSpanElement,
  LabelBadgeProps & Omit<React.HTMLAttributes<HTMLSpanElement>, "color">
>(({ label, className, ...props }, ref) => {
  const data = useFragment(LABEL_FIELDS_FRAGMENT, label);
  const bg = `rgb(${data.color.R},${data.color.G},${data.color.B})`;
  const text = contrastColor(data.color.R, data.color.G, data.color.B);

  return (
    <span
      ref={ref}
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className ?? ""}`}
      style={{ backgroundColor: bg, color: text }}
      {...props}
    >
      {data.name}
    </span>
  );
});
LabelBadge.displayName = "LabelBadge";

// LabelBadge as a TanStack Router link — renders as <a> with label styling.
const CreatedLabelBadgeLink = createLink(
  React.forwardRef<
    HTMLAnchorElement,
    LabelBadgeProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color">
  >(({ label, className, ...props }, ref) => {
    const data = useFragment(LABEL_FIELDS_FRAGMENT, label);
    const bg = `rgb(${data.color.R},${data.color.G},${data.color.B})`;
    const text = contrastColor(data.color.R, data.color.G, data.color.B);

    return (
      <a
        ref={ref}
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium hover:opacity-80 ${className ?? ""}`}
        style={{ backgroundColor: bg, color: text }}
        {...props}
      >
        {data.name}
      </a>
    );
  }),
);

const LabelBadgeLink: LinkComponent<typeof CreatedLabelBadgeLink> = (props) => {
  return <CreatedLabelBadgeLink preload="intent" {...props} />;
};

export { LabelBadge, LabelBadgeLink };
export type { LabelBadgeProps };
