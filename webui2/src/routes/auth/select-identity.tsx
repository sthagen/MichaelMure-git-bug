// Identity selection page (/auth/select-identity).
//
// Reached after a successful OAuth login when no existing git-bug identity
// could be matched automatically (via provider metadata set by the bridge).
// The user can either adopt an existing identity — which links it to their
// OAuth account for future logins — or create a fresh one from their OAuth
// profile.

import { createFileRoute } from "@tanstack/react-router";
import { UserCircle, Plus, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/auth/select-identity")({
  component: RouteComponent,
});

interface IdentityItem {
  repoSlug: string;
  id: string;
  humanId: string;
  displayName: string;
  login?: string;
  avatarUrl?: string;
}

function RouteComponent() {
  const [identities, setIdentities] = useState<IdentityItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    async function loadIdentities() {
      try {
        const res = await fetch("/auth/identities", { credentials: "include" });
        if (!res.ok) throw new Error(`unexpected status ${res.status}`);
        const data: IdentityItem[] = await res.json();
        setIdentities(data);
      } catch (e) {
        setError(String(e));
      }
    }
    void loadIdentities();
  }, []);

  async function adopt(identityId: string | null) {
    setWorking(true);
    try {
      const res = await fetch("/auth/adopt", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(identityId ? { identityId } : {}),
      });
      if (!res.ok) throw new Error(`adopt failed: ${res.status}`);
      // Full page reload to reset Apollo cache and auth state cleanly.
      window.location.assign("/");
    } catch (e) {
      setError(String(e));
      setWorking(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-12">
      <div className="mb-2 flex items-center gap-3">
        <UserCircle className="text-muted-foreground size-6" />
        <h1 className="text-xl font-semibold">Choose your identity</h1>
      </div>
      <p className="text-muted-foreground mb-8 text-sm">
        No git-bug identity was found linked to your account. Select an existing identity to link
        it, or create a new one from your profile.
      </p>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-md border px-4 py-3 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {!identities && !error && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      )}

      <div className="divide-border border-border divide-y rounded-md border">
        {identities?.map((id) => (
          <div key={id.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{id.displayName}</p>
              <p className="text-muted-foreground text-xs">
                {id.login ? `@${id.login} · ` : ""}
                {id.repoSlug} · {id.humanId}
              </p>
            </div>
            <Button
              size="sm"
              disabled={working}
              onClick={() => {
                void adopt(id.id);
              }}
            >
              Adopt
            </Button>
          </div>
        ))}

        {/* Always offer to create a new identity */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium">Create new identity</p>
            <p className="text-muted-foreground text-xs">
              A fresh git-bug identity will be created from your OAuth profile.
            </p>
          </div>
          <Button
            size="sm"
            disabled={working}
            onClick={() => {
              void adopt(null);
            }}
          >
            <Plus className="size-4" />
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
