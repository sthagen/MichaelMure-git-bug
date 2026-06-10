import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { createQueryPreloader } from "@apollo/client/react";

const httpLink = new HttpLink({
  uri: "/graphql",
  // include credentials so future httpOnly auth cookies are sent automatically
  credentials: "include",
});

export const client = new ApolloClient({
  link: httpLink,
  // Data masking is off: fragment colocation is enforced at the type level
  // via codegen's $fragmentRefs branding (inlineFragmentTypes: "mask").
  // Components use codegen's useFragment (a zero-cost cast) to unmask.
  // When @defer is needed, individual components can switch to Apollo's
  // useSuspenseFragment — it works without dataMasking.
  dataMasking: false,

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
