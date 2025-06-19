// src/app/api/interview/history/route.ts
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || typeof user.userId !== 'string') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all sessions for this interviewer, ordering by most recent first
    const sessions = await prisma.interviewSession.findMany({
      where: {
        interviewerId: user.userId,
        status: 'ENDED', // We only want to show completed interviews
      },
      orderBy: {
        endedAt: 'desc',
      },
    });

    return NextResponse.json(sessions);

  } catch (error) {
    console.error('Fetch History Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}