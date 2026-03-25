import type { NextConfig } from 'next';

// Security headers applied to every response.
// CSP for Clerk is intentionally handled separately — Clerk requires
// script-src and frame-src for its CDN and modal flows.
const securityHeaders = [
  // Prevent MIME-type sniffing — browsers must use the declared Content-Type.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Block clickjacking: page can only be framed by the same origin.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Don't send the full URL as Referer when navigating cross-origin.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Force HTTPS for 2 years on all subdomains (only sent over HTTPS).
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Restrict browser feature access — camera, mic, geolocation all off.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // Stop IE/Chrome from opening downloads in-site (XSS vector).
  { key: 'X-Download-Options', value: 'noopen' },
  // Disable cross-origin resource sharing for embedded objects.
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  // CSP frame-ancestors: prevent any third-party site from embedding this app
  // in an iframe (clickjacking defence, alongside X-Frame-Options above).
  // Intentionally scoped — a full script-src CSP is skipped because Clerk
  // requires complex 'unsafe-inline' allowances for its auth modal flows.
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
