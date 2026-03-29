import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { createQueryPreloader } from "@apollo/client/react";

const httpLink = new HttpLink({
  uri: "/graphql",
  // include credentials so future httpOnly auth cookies are sent automatically
  credentials: "include",
});

export const client = new ApolloClient({
  link: httpLink,

  cache: new InMemoryCache({
    typePolicies: {
      // Repository has no id field — treat as a singleton per cache
      Repository: {
        keyFields: [],
      },
    },
  }),
});

// Preloader for use in TanStack Router loaders. Returns a QueryRef
// that components read with useReadQuery() for suspense-based rendering.
export const preloadQuery = createQueryPreloader(client);
