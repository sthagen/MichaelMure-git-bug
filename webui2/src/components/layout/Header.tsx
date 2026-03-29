// Sticky top navigation bar. Adapts based on whether we're on the repo picker
// page (root) or inside a specific repo:
//   - Root: shows logo only, no Code/Issues links
//   - Repo: shows Code + Issues nav links scoped to the current repo slug
//
// In external mode, shows a "Sign in" button when logged out and a sign-out
// action when logged in.

import { Link, useParams } from "@tanstack/react-router";
import { Bug, Plus, Sun, Moon, LogIn, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonLink, NavLink } from "@/components/ui/button-link";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

// SignOutButton sends a POST to /auth/logout and reloads the page.
// A full reload is the simplest way to reset all Apollo cache + React state.
function handleSignOut() {
  void fetch("/auth/logout", { method: "POST", credentials: "include" }).finally(() =>
    window.location.assign("/"),
  );
}

function SignOutButton() {
  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign out">
      <LogOut className="size-4" />
    </Button>
  );
}

export function Header() {
  const { user, mode, loginProviders } = useAuth();
  const { theme, toggle } = useTheme();

  // Detect if we're inside a /$repo route and grab the slug.
  const params = useParams({ strict: false });
  const repo = params.repo ?? null;

  // Don't show repo nav on the /auth/* pages.
  const effectiveRepo = repo === "auth" ? null : repo;

  return (
    <header className="border-border bg-background/95 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-6 px-4">
        {/* Logo always goes to the repo picker root */}
        <Link to="/" className="text-foreground flex items-center gap-2 font-semibold">
          <Bug className="size-4" />
          <span>git-bug</span>
        </Link>

        {/* Repo-scoped nav links — only shown when inside a repo */}
        {effectiveRepo && (
          <nav className="flex items-center gap-1">
            <NavLink
              to="/$repo"
              params={{ repo: effectiveRepo }}
              search={{ ref: "", path: "", type: "tree" as const }}
              activeOptions={{ exact: true }}
            >
              Code
            </NavLink>
            <NavLink
              to="/$repo/issues"
              params={{ repo: effectiveRepo }}
              search={{ q: "status:open", after: "" }}
            >
              Issues
            </NavLink>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          {mode === "readonly" && <span className="text-muted-foreground text-xs">Read only</span>}

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
              <ButtonLink to="/$repo/issues/new" params={{ repo: effectiveRepo }} size="sm">
                <Plus className="size-4" />
                New issue
              </ButtonLink>
              <Link to="/$repo/user/$id" params={{ repo: effectiveRepo, id: user.humanId }}>
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
