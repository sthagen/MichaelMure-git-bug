// auth.tsx — authentication context for the webui.
//
// Currently only supports local (single-user) mode: the identity is taken from
// git config at server startup and fetched via GraphQL.

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { createContext, useContext, type ReactNode } from "react";

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

export interface AuthUser {
  id: string;
  humanId: string;
  name: string | null;
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
  login: string | null;
}

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, loading } = useQuery<{ repository: { userIdentity: AuthUser | null } }>(
    USER_IDENTITY_QUERY,
  );
  const user: AuthUser | null = data?.repository?.userIdentity ?? null;

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
