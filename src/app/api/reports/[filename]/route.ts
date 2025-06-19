// NEXT.JS SERVER: src/app/api/reports/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs'; 
import path from 'node:path';

export async function GET(
  request: NextRequest,
  context: { params: { filename: string } }
) {
  const { filename } = context.params;

  // Basic security: prevent path traversal attacks
  if (!filename || filename.includes('..')) {
    return new NextResponse('Invalid filename', { status: 400 });
  }

  const reportsDir = path.join(process.cwd(), 'reports');
  const filePath = path.join(reportsDir, filename);

  try {
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Report file not found.', { status: 404 });
    }
    const fileBuffer = fs.readFileSync(filePath);
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    headers.set('Content-Disposition', `inline; filename="${filename}"`);

    return new Response(fileBuffer, { headers });
  } catch (error) {
    // If file doesn't exist
    console.error(`Report not found: ${filename}`, error);
    return new NextResponse('An internal server error occurred while retrieving the report.', { status: 500 });
  }
}