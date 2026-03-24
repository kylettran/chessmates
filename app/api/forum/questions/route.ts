import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { writeClient, readClient } from '@/lib/sanity';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  let filter = `_type == "forumQuestion"`;
  const params: Record<string, string> = {};

  if (category) {
    filter += ` && category == $category`;
    params.category = category;
  }
  if (search) {
    filter += ` && (title match $search + "*" || body match $search + "*")`;
    params.search = search;
  }

  const query = `*[${filter}] | order(isPinned desc, _createdAt desc) { _id, _type, _createdAt, title, body, category, authorClerkId, authorName, authorImageUrl, upvotes, isAnswered, isPinned, "answerCount": count(*[_type == "forumAnswer" && questionId == ^._id]) }`;

  try {
    const questions = await readClient.fetch(query, params);
    const { userId } = await auth();
    const isAdmin = !!(userId && userId === process.env.ADMIN_CLERK_USER_ID);
    return NextResponse.json({ questions, isAdmin });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await currentUser();
  const body = await req.json();
  const { title, body: questionBody, category } = body;

  if (!title?.trim() || !questionBody?.trim() || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const authorName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.username || 'Anonymous';

  const doc = {
    _id: crypto.randomUUID(),
    _type: 'forumQuestion' as const,
    title: title.trim(),
    body: questionBody.trim(),
    category,
    authorClerkId: userId,
    authorName,
    upvotes: 0,
    isAnswered: false,
    isPinned: false,
    ...(user?.imageUrl ? { authorImageUrl: user.imageUrl } : {}),
  };

  try {
    const created = await writeClient.create(doc);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
