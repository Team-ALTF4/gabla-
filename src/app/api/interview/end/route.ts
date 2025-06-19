import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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

    // 1. Compile the report content
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

    // 2. Save the report to a file
    const reportsDir = path.join(process.cwd(), 'reports');
    await fs.mkdir(reportsDir, { recursive: true }); // Ensure directory exists
    const fileName = `report-${session.roomCode}-${Date.now()}.txt`;
    const filePath = path.join(reportsDir, fileName);
    await fs.writeFile(filePath, reportContent);

    // 3. Update the session in the database
    const updatedSession = await prisma.interviewSession.update({
      where: { id: session.id },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
        reportFilePath: `/reports/${fileName}`, // Store relative path
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