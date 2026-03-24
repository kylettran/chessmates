import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { writeClient, readClient } from '@/lib/sanity';

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    const [question, answers] = await Promise.all([
      readClient.fetch(`*[_type == "forumQuestion" && _id == $id][0]`, { id }),
      readClient.fetch(
        `*[_type == "forumAnswer" && questionId == $id] | order(isAdminAnswer desc, _createdAt asc)`,
        { id }
      ),
    ]);
    return NextResponse.json({ question, answers });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId || userId !== process.env.ADMIN_CLERK_USER_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await props.params;
  const body = await req.json();

  try {
    if (body.togglePin) {
      const q = await readClient.fetch(
        `*[_type == "forumQuestion" && _id == $id][0]{ isPinned }`,
        { id }
      );
      await writeClient.patch(id).set({ isPinned: !q.isPinned }).commit();
    }
    if (body.toggleAnswered) {
      const q = await readClient.fetch(
        `*[_type == "forumQuestion" && _id == $id][0]{ isAnswered }`,
        { id }
      );
      await writeClient.patch(id).set({ isAnswered: !q.isAnswered }).commit();
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
