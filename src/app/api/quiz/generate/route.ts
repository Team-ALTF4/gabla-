import { getUserFromRequest } from '@/lib/auth';
import { generateQuiz } from '@/lib/gemini';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user?.userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { topic, count, directions } = await request.json();
    if (!topic || !count || !directions) {
      return NextResponse.json({ message: 'Topic, count, and directions are required' }, { status: 400 });
    }

    const quizData = await generateQuiz(topic, parseInt(count), directions);
    return NextResponse.json(quizData);
  } catch (error) {
    console.error('Quiz Generation API Error:', error);
    return NextResponse.json({ message: 'Failed to generate quiz from AI provider' }, { status: 500 });
  }
}