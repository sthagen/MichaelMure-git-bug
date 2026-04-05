import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

interface CodeBreadcrumbProps {
  repoName: string;
  currentRef: string;
  path: string;
  repo: string;
}

// Path breadcrumb for the code browser: repo name / path segments.
// Each segment is a Link to the corresponding tree path.
export function CodeBreadcrumb({ repoName, currentRef, path, repo }: CodeBreadcrumbProps) {
  const parts = path ? path.split("/").filter(Boolean) : [];

  return (
    <div className="flex flex-wrap items-center gap-1 font-mono text-sm">
      <Link
        to="/$repo/tree/$ref/$"
        params={{ repo, ref: currentRef, _splat: "" }}
        className="text-foreground font-medium hover:underline"
      >
        {repoName}
      </Link>

      {parts.map((part, i) => {
        const partPath = parts.slice(0, i + 1).join("/");
        const isLast = i === parts.length - 1;
        return (
          <span key={partPath} className="flex items-center gap-1">
            <ChevronRight className="text-muted-foreground size-3.5" />
            {isLast ? (
              <span className="text-foreground font-medium">{part}</span>
            ) : (
              <Link
                to="/$repo/tree/$ref/$"
                params={{ repo, ref: currentRef, _splat: partPath }}
                className="text-muted-foreground hover:text-foreground hover:underline"
              >
                {part}
              </Link>
            )}
          </span>
        );
      })}

      <span className="text-muted-foreground ml-2 text-xs">@ {currentRef}</span>
    </div>
  );
}
