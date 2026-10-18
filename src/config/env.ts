// Values come from `.env`, overridden by `.env.local` (see `.env` for every variable).
// Expo inlines EXPO_PUBLIC_* vars only on direct `process.env.NAME` access, so no destructuring.
const graphqlUrl = process.env.EXPO_PUBLIC_GRAPHQL_URL;

if (!graphqlUrl) {
  throw new Error('EXPO_PUBLIC_GRAPHQL_URL is not set. See .env.');
}

export const env = {
  graphqlUrl,
  graphqlApiKey: process.env.EXPO_PUBLIC_GRAPHQL_API_KEY || undefined,
};
