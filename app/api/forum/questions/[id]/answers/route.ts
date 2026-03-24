import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { writeClient } from '@/lib/sanity';

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await props.params;
  const user = await currentUser();
  const body = await req.json();

  if (!body.body?.trim()) {
    return NextResponse.json({ error: 'Answer body is required' }, { status: 400 });
  }

  const isAdmin = userId === process.env.ADMIN_CLERK_USER_ID;
  const authorName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.username || 'Anonymous';

  const doc = {
    _id: crypto.randomUUID(),
    _type: 'forumAnswer' as const,
    questionId: id,
    body: body.body.trim(),
    authorClerkId: userId,
    authorName,
    isAdminAnswer: isAdmin,
    upvotes: 0,
    ...(user?.imageUrl ? { authorImageUrl: user.imageUrl } : {}),
  };

  try {
    const created = await writeClient.create(doc);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create answer' }, { status: 500 });
  }
}
