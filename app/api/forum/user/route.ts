import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { readClient } from '@/lib/sanity';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to view your activity' }, { status: 401 });
  }

  try {
    const [questions, answers] = await Promise.all([
      readClient.fetch(
        `*[_type == "forumQuestion" && authorClerkId == $userId] | order(_createdAt desc) {
          _id, _type, _createdAt, title, body, category,
          authorClerkId, authorName, authorImageUrl,
          upvotes, isAnswered, isPinned,
          "answerCount": count(*[_type == "forumAnswer" && questionId == ^._id]),
          "hasAdminAnswer": count(*[_type == "forumAnswer" && questionId == ^._id && isAdminAnswer == true]) > 0
        }`,
        { userId }
      ),
      readClient.fetch(
        `*[_type == "forumAnswer" && authorClerkId == $userId] | order(_createdAt desc) {
          _id, _type, _createdAt, body, questionId,
          authorClerkId, authorName, authorImageUrl,
          isAdminAnswer, upvotes,
          "questionTitle": *[_type == "forumQuestion" && _id == ^.questionId][0].title
        }`,
        { userId }
      ),
    ]);

    return NextResponse.json({ questions, answers });
  } catch (err) {
    console.error('User forum GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
