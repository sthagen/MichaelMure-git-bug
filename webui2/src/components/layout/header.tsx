// Sticky top navigation bar. Adapts based on whether we're on the repo picker
// page (root) or inside a specific repo:
//   - Root: shows logo only, no Code/Issues links
//   - Repo: shows Code + Issues nav links scoped to the current repo slug

import { Link, useParams, useRouterState } from "@tanstack/react-router";
import { Plus, Sun, Moon } from "lucide-react";

import Logo from "@/assets/logo.svg?react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function Header() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  // Detect if we're inside a /$repo route and grab the slug.
  const params = useParams({ strict: false });
  const repo = params.repo ?? null;

  return (
    <header className="border-border bg-background/95 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-6 px-4">
        {/* Logo always goes to the repo picker root */}
        <Link to="/" className="text-foreground flex items-center gap-2 font-semibold">
          <Logo className="size-5" />
          <span>git-bug</span>
        </Link>

        {/* Repo-scoped nav links — only shown when inside a repo */}
        {repo && <RepoNav repo={repo} />}

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={toggle} title="Toggle theme">
            {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </Button>

          {user && repo && (
            <>
              <ButtonLink to="/$repo/issues/new" params={{ repo }} size="sm">
                <Plus className="size-4" />
                New issue
              </ButtonLink>
              <Link
                to="/$repo/user/$id"
                params={{ repo, id: user.humanId }}
                search={{ status: "open" as const, after: "" }}
              >
                <Avatar className="size-7">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
                  <AvatarFallback className="text-xs">
                    {user.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const navLinkBase = "rounded-md px-3 py-1.5 text-sm font-medium transition-colors";
const navLinkActive = "bg-accent text-accent-foreground";
const navLinkInactive = "text-muted-foreground hover:bg-accent hover:text-accent-foreground";

function RepoNav({ repo }: { repo: string }) {
  // Determine which section is active from the matched route IDs.
  // The _code layout match means we're in the code browser; _issues means issues.
  const matchedIds = useRouterState({
    select: (s) => s.matches.map((m) => m.routeId),
  });
  const isCodeActive = matchedIds.some((id) => id.includes("/_code"));
  const isIssuesActive = matchedIds.some((id) => id.includes("/_issues"));

  return (
    <nav className="flex items-center gap-1">
      <Link
        to="/$repo"
        params={{ repo }}
        className={cn(navLinkBase, isCodeActive ? navLinkActive : navLinkInactive)}
      >
        Code
      </Link>
      <Link
        to="/$repo/issues"
        params={{ repo }}
        search={{ q: "status:open", after: "" }}
        className={cn(navLinkBase, isIssuesActive ? navLinkActive : navLinkInactive)}
      >
        Issues
      </Link>
    </nav>
  );
}
