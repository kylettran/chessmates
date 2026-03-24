import { createClient } from '@sanity/client';

export const writeClient = createClient({
  projectId: 'y9qb1k3m',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

export const readClient = createClient({
  projectId: 'y9qb1k3m',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});
