import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Returns whether the current session belongs to an admin.
 * Keeps ADMIN_CLERK_USER_ID server-only — never exposed in client JS bundles.
 */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ isAdmin: false });
  }

  const isAdmin = userId === process.env.ADMIN_CLERK_USER_ID;
  return NextResponse.json({ isAdmin });
}
