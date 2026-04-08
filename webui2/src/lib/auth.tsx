// auth.tsx — current user hook for the webui.
//
// The UserIdentity query is preloaded in the root route loader and consumed
// via useSuspenseQuery, so useAuth() always returns a resolved user.

import { useSuspenseQuery } from "@apollo/client/react";

import { graphql } from "@/__generated__/gql";

export const USER_IDENTITY_QUERY = graphql(`
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
`);

export interface AuthUser {
  id: string;
  humanId: string;
  name: string | null;
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
  login: string | null;
}

export function useAuth(): { user: AuthUser } {
  const { data } = useSuspenseQuery(USER_IDENTITY_QUERY);
  return { user: data.repository!.userIdentity! as AuthUser };
}
