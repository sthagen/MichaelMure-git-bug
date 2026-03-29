import { ChevronRight } from "lucide-react";

interface CodeBreadcrumbProps {
  repoName: string;
  ref: string;
  path: string;
  // called when user clicks a breadcrumb segment — returns new path
  onNavigate: (path: string) => void;
}

// Path breadcrumb for the code browser: repo name / ref / path segments.
// Each segment is clickable to navigate up the tree.
export function CodeBreadcrumb({ repoName, ref, path, onNavigate }: CodeBreadcrumbProps) {
  const parts = path ? path.split("/").filter(Boolean) : [];

  return (
    <div className="flex flex-wrap items-center gap-1 font-mono text-sm">
      <button
        onClick={() => onNavigate("")}
        className="text-foreground font-medium hover:underline"
      >
        {repoName}
      </button>

      {parts.map((part, i) => {
        const partPath = parts.slice(0, i + 1).join("/");
        const isLast = i === parts.length - 1;
        return (
          <span key={partPath} className="flex items-center gap-1">
            <ChevronRight className="text-muted-foreground size-3.5" />
            {isLast ? (
              <span className="text-foreground font-medium">{part}</span>
            ) : (
              <button
                onClick={() => onNavigate(partPath)}
                className="text-muted-foreground hover:text-foreground hover:underline"
              >
                {part}
              </button>
            )}
          </span>
        );
      })}

      <span className="text-muted-foreground ml-2 text-xs">@ {ref}</span>
    </div>
  );
}
