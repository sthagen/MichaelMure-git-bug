import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const httpLink = createHttpLink({
  uri: '/graphql',
  // include credentials so future httpOnly auth cookies are sent automatically
  credentials: 'include',
})

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
})
