// src/app/api/stream/token/route.ts

import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// 1. CORRECT IMPORT from the correct package
import { StreamClient } from '@stream-io/node-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_SECRET_KEY;
    if (!apiKey || !apiSecret) {
      return NextResponse.json({ message: 'Stream API key or secret is not configured.' }, { status: 500 });
    }

    const body = await request.json();
    const { userId, roomCode } = body;
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    let isAuthorized = false;

    // Authorization logic remains the same
    const interviewer = await getUserFromRequest(request);
    if (interviewer && typeof interviewer.userId === 'string' && interviewer.userId === userId) {
      isAuthorized = true;
    }
    if (!isAuthorized && roomCode) {
      const session = await prisma.interviewSession.findFirst({
        where: { roomCode, status: { in: ['PENDING', 'ACTIVE'] } },
      });
      if (session) isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ message: 'Unauthorized to get token' }, { status: 401 });
    }

    // 2. CORRECT CLIENT INSTANTIATION
    // The StreamClient constructor takes apiKey and apiSecret as its two arguments.
    // This resolves the "Expected 1 arguments, but got 2" error's root cause.
    const serverClient = new StreamClient(apiKey, apiSecret);

    // 3. CORRECT TOKEN CREATION
    // The .createToken() method exists and takes the userId and an optional expiration.
    // This resolves the "Property 'createToken' does not exist" error.
    const exp = Math.round(new Date().getTime() / 1000) + 60 * 60 * 3; // 3-hour validity
    const token = serverClient.createToken(userId, exp);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating Stream token:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}