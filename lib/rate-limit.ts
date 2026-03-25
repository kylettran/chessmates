/**
 * Simple in-memory sliding-window rate limiter.
 * Suitable for low-traffic apps deployed on Vercel (per-region, per-instance).
 * For high-traffic production use, swap the store for Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Prune expired entries every 5 minutes to prevent memory growth.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

interface Options {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface Result {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function rateLimit(identifier: string, opts: Options): Result {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + opts.windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { success: true, limit: opts.limit, remaining: opts.limit - 1, resetAt };
  }

  if (entry.count >= opts.limit) {
    return { success: false, limit: opts.limit, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, limit: opts.limit, remaining: opts.limit - entry.count, resetAt: entry.resetAt };
}

/** Extract the most-trusted client IP from a Next.js request. */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

/** Returns a 429 JSON response with Retry-After and RateLimit headers. */
export function rateLimitResponse(result: Result): Response {
  const retryAfterSec = Math.ceil((result.resetAt - Date.now()) / 1000);
  return new Response(
    JSON.stringify({ error: 'Too many requests — please slow down.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSec),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      },
    }
  );
}
