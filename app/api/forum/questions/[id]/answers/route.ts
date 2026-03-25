import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { writeClient } from '@/lib/sanity';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to post an answer' }, { status: 401 });
  }

  const { id: questionId } = await params;
  const body = await req.json();
  const { body: answerBody } = body;

  if (!answerBody?.trim()) {
    return NextResponse.json({ error: 'Answer body is required' }, { status: 400 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  const authorName = user.fullName
    || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    || user.emailAddresses?.[0]?.emailAddress?.split('@')[0]
    || 'Anonymous';

  const isAdminAnswer = userId === process.env.ADMIN_CLERK_USER_ID;

  const doc = {
    _id:           crypto.randomUUID(),
    _type:         'forumAnswer',
    questionId,
    body:          answerBody.trim(),
    authorClerkId: userId,
    authorName,
    authorImageUrl: user.imageUrl ?? '',
    isAdminAnswer,
    upvotes:       0,
  };

  try {
    const created = await writeClient.createOrReplace(doc);
    return NextResponse.json({ answer: created }, { status: 201 });
  } catch (err) {
    console.error('Answer POST error:', err);
    return NextResponse.json({ error: 'Failed to post answer' }, { status: 500 });
  }
}
