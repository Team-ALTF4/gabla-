import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { roomCode, processList } = await request.json();
    if (!roomCode || !processList) {
      return NextResponse.json({ message: 'Room code and process list are required' }, { status: 400 });
    }

    const session = await prisma.interviewSession.findUnique({ where: { roomCode } });
    if (!session) {
      console.warn(`Process log received for non-existent room: ${roomCode}`);
      return NextResponse.json({ success: false }, { status: 404 });
    }

    await prisma.processLog.create({
      data: { logContent: processList, interviewSessionId: session.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Process Logging Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}