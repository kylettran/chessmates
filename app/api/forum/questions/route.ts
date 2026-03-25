import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { writeClient, readClient } from '@/lib/sanity';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { sanitizeTitle, sanitizeBody, isValidCategory } from '@/lib/sanitize';

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
    upvotes, upvoterIds, isAnswered, isPinned,
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

  // Rate limit: 5 new questions per user per hour.
  const rl = rateLimit(`question:${userId}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!rl.success) return rateLimitResponse(rl);

  const body = await req.json();
  const { title, body: questionBody, category } = body;

  const cleanTitle    = sanitizeTitle(title);
  const cleanBody     = sanitizeBody(questionBody);

  if (!cleanTitle) {
    return NextResponse.json({ error: 'Title is required (max 120 characters)' }, { status: 400 });
  }
  if (!cleanBody) {
    return NextResponse.json({ error: 'Details are required (max 5000 characters)' }, { status: 400 });
  }
  if (!isValidCategory(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  const authorName = user.fullName
    || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    || user.emailAddresses?.[0]?.emailAddress?.split('@')[0]
    || 'Anonymous';

  const authorImageUrl = user.imageUrl ?? '';

  const doc = {
    _id:            crypto.randomUUID(),
    _type:          'forumQuestion',
    title:          cleanTitle,
    body:           cleanBody,
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
