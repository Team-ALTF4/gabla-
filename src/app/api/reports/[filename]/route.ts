// NEXT.JS SERVER: src/app/api/reports/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  // Basic security: prevent path traversal attacks
  if (filename.includes('..')) {
    return new NextResponse('Invalid filename', { status: 400 });
  }

  const reportsDir = path.join(process.cwd(), 'reports');
  const filePath = path.join(reportsDir, filename);

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain');

    return new Response(fileBuffer, { headers });
  } catch (error) {
    // If file doesn't exist
    console.error(`Report not found: ${filename}`, error);
    return new NextResponse('Report not found', { status: 404 });
  }
}