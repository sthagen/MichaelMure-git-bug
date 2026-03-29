// Sticky top navigation bar. Adapts based on whether we're on the repo picker
// page (root) or inside a specific repo:
//   - Root: shows logo only, no Code/Issues links
//   - Repo: shows Code + Issues nav links scoped to the current repo slug
//
// In external mode, shows a "Sign in" button when logged out and a sign-out
// action when logged in.

import { Bug, Plus, Sun, Moon, LogIn, LogOut } from "lucide-react";
import { Link, useMatch, NavLink } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

// SignOutButton sends a POST to /auth/logout and reloads the page.
// A full reload is the simplest way to reset all Apollo cache + React state.
function SignOutButton() {
  function handleSignOut() {
    void fetch("/auth/logout", { method: "POST", credentials: "include" }).finally(() =>
      window.location.assign("/"),
    );
  }
  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign out">
      <LogOut className="size-4" />
    </Button>
  );
}

export function Header() {
  const { user, mode, loginProviders } = useAuth();
  const { theme, toggle } = useTheme();

  // Detect if we're inside a /:repo route and grab the slug.
  // useMatch works from any component in the tree, unlike useParams which is
  // scoped to the nearest Route element.
  const repoMatch = useMatch({ path: "/:repo/*", end: false });
  const repo = repoMatch?.params.repo ?? null;

  // Don't show repo nav on the /auth/* pages.
  const effectiveRepo = repo === "auth" ? null : repo;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-6 px-4">
        {/* Logo always goes to the repo picker root */}
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <Bug className="size-4" />
          <span>git-bug</span>
        </Link>

        {/* Repo-scoped nav links — only shown when inside a repo */}
        {effectiveRepo && (
          <nav className="flex items-center gap-1">
            <NavLink
              to={`/${effectiveRepo}`}
              end
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              Code
            </NavLink>
            <NavLink
              to={`/${effectiveRepo}/issues`}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              Issues
            </NavLink>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          {mode === "readonly" && <span className="text-xs text-muted-foreground">Read only</span>}

          <Button variant="ghost" size="icon" onClick={toggle} title="Toggle theme">
            {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </Button>

          {/* External mode: show sign-in buttons when logged out */}
          {mode === "external" &&
            !user &&
            loginProviders.map((p) => (
              <Button key={p} asChild size="sm">
                <a href={`/auth/login?provider=${p}`}>
                  <LogIn className="size-4" />
                  Sign in with {providerLabel(p)}
                </a>
              </Button>
            ))}

          {user && effectiveRepo && (
            <>
              <Button asChild size="sm">
                <Link to={`/${effectiveRepo}/issues/new`}>
                  <Plus className="size-4" />
                  New issue
                </Link>
              </Button>
              <Link to={`/${effectiveRepo}/user/${user.humanId}`}>
                <Avatar className="size-7">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
                  <AvatarFallback className="text-xs">
                    {user.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          )}

          {/* Sign out only shown in external mode when logged in */}
          {mode === "external" && user && <SignOutButton />}
        </div>
      </div>
    </header>
  );
}

function providerLabel(name: string): string {
  const labels: Record<string, string> = { github: "GitHub", gitlab: "GitLab", gitea: "Gitea" };
  return labels[name] ?? name;
}
