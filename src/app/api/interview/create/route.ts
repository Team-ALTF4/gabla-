// src/app/api/interview/create/route.ts
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    // --- CORRECTED TYPE GUARD ---
    // This explicitly checks that user exists AND user.userId is a string.
    // This guarantees the type for Prisma.
    if (!user || typeof user.userId !== 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { hasWhiteboard, hasCodingChallenge, hasQuiz, quizTopic, quizQuestionCount, quizQuestionDuration } = body;

    const session = await prisma.interviewSession.create({
      data: {
        roomCode: nanoid(8),
        // Now TypeScript knows user.userId is a string, satisfying Prisma's requirement.
        interviewerId: user.userId, 
        hasWhiteboard: hasWhiteboard ?? false,
        hasCodingChallenge: hasCodingChallenge ?? false,
        hasQuiz: hasQuiz ?? false,
        quizTopic: hasQuiz ? quizTopic : null,
        quizQuestionCount: hasQuiz ? parseInt(quizQuestionCount) : null,
        quizQuestionDuration: hasQuiz ? parseInt(quizQuestionDuration) : null,
      },
    });

    return NextResponse.json({ roomCode: session.roomCode }, { status: 201 });
  } catch (error) {
    console.error('Create Interview Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}