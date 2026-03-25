import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { writeClient, readClient } from '@/lib/sanity';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search   = searchParams.get('search');

  let filter = '_type == "forumQuestion"';
  const params: Record<string, string> = {};

  if (category && category !== 'all') {
    filter += ' && category == $category';
    params.category = category;
  }
  if (search && search.trim()) {
    filter += ' && (title match $search || body match $search)';
    params.search = `*${search.trim()}*`;
  }

  const query = `*[${filter}] | order(isPinned desc, _createdAt desc) {
    _id, _type, _createdAt, title, body, category,
    authorClerkId, authorName, authorImageUrl,
    upvotes, isAnswered, isPinned,
    "answerCount": count(*[_type == "forumAnswer" && questionId == ^._id]),
    "hasAdminAnswer": count(*[_type == "forumAnswer" && questionId == ^._id && isAdminAnswer == true]) > 0
  }`;

  try {
    const questions = await readClient.fetch(query, params);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error('Forum GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to ask a question' }, { status: 401 });
  }

  const user = await currentUser();
  const body = await req.json();
  const { title, body: questionBody, category } = body;

  if (!title?.trim() || !questionBody?.trim() || !category) {
    return NextResponse.json({ error: 'Title, body, and category are required' }, { status: 400 });
  }

  const authorName = user?.fullName
    || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
    || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0]
    || 'Anonymous';

  const authorImageUrl = user?.imageUrl ?? '';

  const doc = {
    _id:            crypto.randomUUID(),
    _type:          'forumQuestion',
    title:          title.trim(),
    body:           questionBody.trim(),
    category,
    authorClerkId:  userId,
    authorName,
    authorImageUrl,
    upvotes:        0,
    isAnswered:     false,
    isPinned:       false,
  };

  try {
    const created = await writeClient.createOrReplace(doc);
    return NextResponse.json({ question: created }, { status: 201 });
  } catch (err) {
    console.error('Forum POST error:', err);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
