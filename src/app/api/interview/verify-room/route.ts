// src/app/api/interview/verify-room/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { roomCode } = await request.json();
    if (!roomCode) {
      return NextResponse.json({ message: 'Room code is required' }, { status: 400 });
    }

    // IMPORTANT: When the INTERVIEWEE joins, the status will be 'PENDING'.
    // The INTERVIEWER is the one who will be re-joining their own room, so the status could be 'ACTIVE'.
    // We should allow joining if the room is PENDING or ACTIVE.
    const session = await prisma.interviewSession.findUnique({
      where: { roomCode },
    });

    if (!session || session.status === 'ENDED') {
      return NextResponse.json({ message: 'Invalid, expired, or completed room code' }, { status: 404 });
    }
    
    // This is the data the client page is waiting for.
    return NextResponse.json({
      isValid: true,
      sessionConfig: {
        hasWhiteboard: session.hasWhiteboard,
        hasCodingChallenge: session.hasCodingChallenge,
        hasQuiz: session.hasQuiz,
        quizTopic: session.quizTopic,
        quizQuestionCount: session.quizQuestionCount,
        quizQuestionDuration: session.quizQuestionDuration,
      },
    });
  } catch (error) {
    console.error('Verify Room Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}