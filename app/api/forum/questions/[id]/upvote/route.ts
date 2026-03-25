import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { writeClient, readClient } from '@/lib/sanity';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { isValidDocumentId } from '@/lib/sanitize';

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

  if (!isValidDocumentId(id)) {
    return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
  }

  try {
    // Fetch current voter list to enforce one vote per user per question.
    const question = await readClient.fetch<{ upvoterIds?: string[] } | null>(
      `*[_type == "forumQuestion" && _id == $id][0]{ upvoterIds }`,
      { id }
    );

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    if (Array.isArray(question.upvoterIds) && question.upvoterIds.includes(userId)) {
      return NextResponse.json({ error: 'Already upvoted' }, { status: 409 });
    }

    // Atomically add userId to upvoterIds and increment the counter.
    const updated = await writeClient
      .patch(id)
      .setIfMissing({ upvoterIds: [] })
      .append('upvoterIds', [userId])
      .inc({ upvotes: 1 })
      .commit();

    return NextResponse.json({ upvotes: updated.upvotes });
  } catch (err) {
    console.error('Upvote error:', err);
    return NextResponse.json({ error: 'Failed to upvote' }, { status: 500 });
  }
}
