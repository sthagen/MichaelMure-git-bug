// auth.tsx — current user hook for the webui.
//
// Fetches the user identity from git config via GraphQL. Apollo handles
// deduplication and caching, so no Provider/Context is needed.

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

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

export function useAuth(): { user: AuthUser | null; loading: boolean } {
  const { data, loading } = useQuery<{ repository: { userIdentity: AuthUser | null } }>(
    USER_IDENTITY_QUERY,
  );
  return { user: data?.repository?.userIdentity ?? null, loading };
}
