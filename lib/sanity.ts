import { createClient } from '@sanity/client';

// Single authenticated client — used for ALL reads and writes.
// useCdn: false ensures we never get stale CDN-cached data.
export const sanityClient = createClient({
  projectId: 'y9qb1k3m',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

// Aliases so existing imports don't break
export const readClient  = sanityClient;
export const writeClient = sanityClient;
