import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user?.userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { roomCode } = await request.json();
    const session = await prisma.interviewSession.findFirst({
      where: { roomCode, interviewerId: user.userId },
      include: { processLogs: { orderBy: { loggedAt: 'asc' } } },
    });

    if (!session) {
      return NextResponse.json({ message: 'Session not found or you are not the owner' }, { status: 404 });
    }

    let reportContent = `Process Log Report for Interview Session: ${session.roomCode}\n`;
    reportContent += `Date: ${new Date().toISOString()}\n\n`;
    reportContent += '--- BEGIN LOGS ---\n\n';

    if (session.processLogs.length > 0) {
      session.processLogs.forEach(log => {
        reportContent += `[${log.loggedAt.toISOString()}]\n${log.logContent}\n\n`;
      });
    } else {
      reportContent += 'No processes were logged during this session.\n';
    }
    reportContent += '--- END LOGS ---';

    const reportFileName = `reports/report-${session.roomCode}-${Date.now()}.txt`;
    
    const blob = await put(reportFileName, reportContent, {
      access: 'public',
      contentType: 'text/plain; charset=utf-8',
    });

    const updatedSession = await prisma.interviewSession.update({
      where: { id: session.id },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
        reportFilePath: blob.url,
      },
    });

    return NextResponse.json({
      message: 'Interview ended successfully.',
      reportUrl: updatedSession.reportFilePath,
    });
  } catch (error) {
    console.error('End Interview Error:', error);
    return NextResponse.json({ message: 'Failed to end interview and generate report' }, { status: 500 });
  }
}
