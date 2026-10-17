import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

import { env } from '@/config/env';

/**
 * GraphQL client for syncing data into SQLite. Apollo's cache is bypassed: SQLite is the single
 * source of truth, and a second in-memory copy could only drift from it.
 */
export const graphqlClient = new ApolloClient({
  link: new HttpLink({
    uri: env.graphqlUrl,
    headers: env.graphqlApiKey ? { 'x-api-key': env.graphqlApiKey } : {},
  }),
  // Required by Apollo, but unused: `defaultOptions` makes queries skip it.
  cache: new InMemoryCache(),
  defaultOptions: {
    query: { fetchPolicy: 'no-cache' },
  },
});
