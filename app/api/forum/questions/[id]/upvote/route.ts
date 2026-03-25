import { NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
