import { NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity';

export async function POST(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    await writeClient.patch(id).inc({ upvotes: 1 }).commit();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to upvote' }, { status: 500 });
  }
}
