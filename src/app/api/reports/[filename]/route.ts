// src/app/api/reports/[filename]/route.ts

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises'; // Using the promises API for async operations

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  // Security check to prevent path traversal
  if (!filename || filename.includes('..') || filename.includes('/')) {
    return new NextResponse('Invalid filename', { status: 400 });
  }

  const reportsDir = path.join(process.cwd(), 'reports');
  const filePath = path.join(reportsDir, filename);

  try {
    // --- THIS IS THE KEY FIX ---
    // We read the file with the 'utf-8' encoding.
    // This makes fs.readFile return a `string`, not a `Buffer`.
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    headers.set('Content-Disposition', `inline; filename="${filename}"`);

    // The Response constructor can handle a string body with zero ambiguity.
    return new Response(fileContent, {
      status: 200,
      headers: headers,
    });

  } catch (error: any) {
    // Check for "file not found" errors
    if (error.code === 'ENOENT') {
      console.error(`Report file not found: ${filePath}`);
      return new NextResponse('Report not found', { status: 404 });
    }
    
    // Handle other potential errors during file reading
    console.error(`Error reading report ${filename}:`, error);
    return new NextResponse('Error reading report file', { status: 500 });
  }
}
