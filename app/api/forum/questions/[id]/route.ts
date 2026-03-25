import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { writeClient, readClient } from '@/lib/sanity';
import { isValidDocumentId } from '@/lib/sanitize';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isValidDocumentId(id)) {
    return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
  }

  try {
    const [question, answers] = await Promise.all([
      readClient.fetch(
        `*[_type == "forumQuestion" && _id == $id][0]`,
        { id }
      ),
      readClient.fetch(
        `*[_type == "forumAnswer" && questionId == $id] | order(isAdminAnswer desc, _createdAt asc)`,
        { id }
      ),
    ]);

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ question, answers });
  } catch (err) {
    console.error('Question GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId || userId !== process.env.ADMIN_CLERK_USER_ID) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { id } = await params;

  if (!isValidDocumentId(id)) {
    return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
  }

  const body = await req.json();
  const { isPinned, isAnswered } = body;

  try {
    const patch = writeClient.patch(id);
    if (typeof isPinned === 'boolean')   patch.set({ isPinned });
    if (typeof isAnswered === 'boolean') patch.set({ isAnswered });
    const updated = await patch.commit();
    return NextResponse.json({ question: updated });
  } catch (err) {
    console.error('Question PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}
