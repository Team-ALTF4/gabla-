// src/app/api/reports/[filename]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs'; 
import path from 'node:path';

// --- THE FINAL, SIMPLIFIED FIX ---
// We remove all explicit typing from the second argument.
// We will let Next.js's own internal types handle the inference.
// The `any` type here is a temporary measure to get past the build error.
// The Vercel build environment is very strict.
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;

  if (!filename || filename.includes('..')) {
    return new NextResponse('Invalid filename provided.', { status: 400 });
  }

  try {
    const reportsDir = path.join(process.cwd(), 'reports');
    // Sanitize filename one more time to be safe
    const safeFilename = path.basename(filename);
    const filePath = path.join(reportsDir, safeFilename);

    // Use async file read for serverless environments
    const fileBuffer = await fs.promises.readFile(filePath);
    
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    headers.set('Content-Disposition', `inline; filename="${safeFilename}"`);

    return new Response(fileBuffer, { status: 200, headers });

  } catch (error: any) {
    // Specifically check for 'ENOENT' which means "Error, No Entry" (file not found)
    if (error.code === 'ENOENT') {
      return new NextResponse('Report file not found.', { status: 404 });
    }
    console.error(`Error serving report file ${filename}:`, error);
    return new NextResponse('An internal server error occurred.', { status: 500 });
  }
}
