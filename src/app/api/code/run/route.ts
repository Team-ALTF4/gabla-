// NEXT.JS SERVER: src/app/api/code/run/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Judge0 Language ID Mapping
const languageToIdMap: Record<string, number> = {
  javascript: 93, // Node.js
  python: 71,     // Python 3.8
  java: 62,       // Java 15
  cpp: 54,        // C++ 17
};

export async function POST(request: NextRequest) {
  const { code, language } = await request.json();
  const apiKey = process.env.JUDGE0_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Code execution service is not configured.' }, { status: 500 });
  }

  const languageId = languageToIdMap[language];
  if (!languageId) {
    return NextResponse.json({ error: 'Unsupported language.' }, { status: 400 });
  }

  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions',
    params: { base64_encoded: 'false', fields: '*' },
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    },
    data: {
      language_id: languageId,
      source_code: code,
      // You can add stdin (standard input) here if needed
      // stdin: 'some input for the code'
    },
  };

  try {
    // 1. Create a submission
    const submissionResponse = await axios.request(options);
    const token = submissionResponse.data.token;

    if (!token) {
      throw new Error('Failed to create submission.');
    }

    let result;
    // 2. Poll for the result
    while (true) {
      const resultResponse = await axios.request({
        method: 'GET',
        url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
        params: { base64_encoded: 'false', fields: '*' },
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
      });

      const statusId = resultResponse.data.status.id;
      // 1 = In Queue, 2 = Processing
      if (statusId > 2) {
        result = resultResponse.data;
        break;
      }
      // Wait for a short period before polling again
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Judge0 API Error:", error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to execute code.' }, { status: 500 });
  }
}