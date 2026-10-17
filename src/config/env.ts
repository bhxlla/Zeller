// Values come from `.env` / `.env.local` (see `.env.example`).
// Expo inlines EXPO_PUBLIC_* vars only on direct `process.env.NAME` access, so no destructuring.
const graphqlUrl = process.env.EXPO_PUBLIC_GRAPHQL_URL;

if (!graphqlUrl) {
  throw new Error('EXPO_PUBLIC_GRAPHQL_URL is not set. See .env.example.');
}

export const env = {
  graphqlUrl,
  graphqlApiKey: process.env.EXPO_PUBLIC_GRAPHQL_API_KEY || undefined,
};
