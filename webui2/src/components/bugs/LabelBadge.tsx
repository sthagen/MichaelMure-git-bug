interface LabelBadgeProps {
  name: string;
  color: { R: number; G: number; B: number };
  onClick?: (name: string) => void;
}

function contrastColor(r: number, g: number, b: number): string {
  // Perceived luminance — pick black or white text for readability
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.9)";
}

// Coloured label pill. Renders as a <button> when onClick is provided,
// used in BugRow and UserProfilePage to filter issues by label.
export function LabelBadge({ name, color, onClick }: LabelBadgeProps) {
  const bg = `rgb(${color.R},${color.G},${color.B})`;
  const text = contrastColor(color.R, color.G, color.B);

  if (onClick) {
    return (
      <button
        type="button"
        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium hover:opacity-80"
        style={{ backgroundColor: bg, color: text }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick(name);
        }}
      >
        {name}
      </button>
    );
  }

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {name}
    </span>
  );
}
