// auth.tsx — authentication context for the webui.
//
// Auth has three modes determined by the server's serverConfig.authMode:
//
//   local    Single-user mode. The identity is taken from git config at
//            server startup. No login UI is needed.
//
//   external Multi-user mode. Users log in via an OAuth or OIDC provider.
//            The current user is fetched from GET /auth/user and can be null
//            (not logged in) even while the server is running.
//
//   readonly No writes allowed. No identity is ever returned.
//
// All three modes expose the same AuthContextValue shape, so the rest of the
// component tree doesn't need to know which mode is active.

import { gql, useQuery } from "@apollo/client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { useServerConfigQuery } from "@/__generated__/graphql";

// AuthUser matches the Identity type fields we care about for auth purposes.
export interface AuthUser {
  id: string;
  humanId: string;
  name: string | null;
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
  login: string | null;
}

// 'local'    — single-user mode, identity from git config
// 'external' — multi-user mode, identity from OAuth/OIDC session
// 'readonly' — no identity, write operations disabled
export type AuthMode = "local" | "external" | "readonly";

export interface AuthContextValue {
  user: AuthUser | null;
  mode: AuthMode;
  // List of enabled login provider names, e.g. ['github']. Only set in external mode.
  loginProviders: string[];
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  mode: "readonly",
  loginProviders: [],
  loading: true,
});

// ── Local mode ────────────────────────────────────────────────────────────────

const USER_IDENTITY_QUERY = gql`
  query UserIdentity {
    repository {
      userIdentity {
        id
        humanId
        name
        displayName
        avatarUrl
        email
        login
      }
    }
  }
`;

function LocalAuthProvider({
  children,
  loginProviders,
}: {
  children: ReactNode;
  loginProviders: string[];
}) {
  const { data, loading } = useQuery(USER_IDENTITY_QUERY);
  const user: AuthUser | null = data?.repository?.userIdentity ?? null;
  const mode: AuthMode = loading ? "local" : user ? "local" : "readonly";
  return (
    <AuthContext.Provider value={{ user, mode, loginProviders, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── External (OAuth / OIDC) mode ──────────────────────────────────────────────

// ExternalAuthProvider fetches the current user from the REST endpoint that the
// Go auth handler exposes. A 401 response means "not logged in" (user is null),
// not an error.
function ExternalAuthProvider({
  children,
  loginProviders,
}: {
  children: ReactNode;
  loginProviders: string[];
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/auth/user", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) return null;
        if (!res.ok) throw new Error(`/auth/user returned ${res.status}`);
        return res.json() as Promise<AuthUser>;
      })
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, mode: "external", loginProviders, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Read-only mode ────────────────────────────────────────────────────────────

function ReadonlyAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{ user: null, mode: "readonly", loginProviders: [], loading: false }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Root provider ─────────────────────────────────────────────────────────────

// AuthProvider first fetches serverConfig to learn the auth mode, then renders
// the appropriate sub-provider. The split avoids conditional hook calls.
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, loading } = useServerConfigQuery();

  if (loading || !data) {
    // Keep the default context (readonly + loading:true) while the config loads.
    return (
      <AuthContext.Provider
        value={{ user: null, mode: "readonly", loginProviders: [], loading: true }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  const { authMode, loginProviders } = data.serverConfig;

  if (authMode === "readonly") {
    return <ReadonlyAuthProvider>{children}</ReadonlyAuthProvider>;
  }

  if (authMode === "external") {
    return <ExternalAuthProvider loginProviders={loginProviders}>{children}</ExternalAuthProvider>;
  }

  // Default: 'local'
  return <LocalAuthProvider loginProviders={loginProviders}>{children}</LocalAuthProvider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
