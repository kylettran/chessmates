import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { writeClient } from '@/lib/sanity';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Must be signed in — prevents unauthenticated upvote spam.
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to upvote' }, { status: 401 });
  }

  // Rate limit: 10 upvotes per user per minute.
  const result = rateLimit(`upvote:${userId}`, { limit: 10, windowMs: 60_000 });
  if (!result.success) return rateLimitResponse(result);

  const { id } = await params;

  // Basic ID validation — Sanity document IDs are alphanumeric + hyphens.
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
  }

  try {
    const updated = await writeClient
      .patch(id)
      .inc({ upvotes: 1 })
      .commit();
    return NextResponse.json({ upvotes: updated.upvotes });
  } catch (err) {
    console.error('Upvote error:', err);
    return NextResponse.json({ error: 'Failed to upvote' }, { status: 500 });
  }
}
