// NEXT.JS SERVER: src/app/api/quiz/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getIO } from '@/lib/socket-helper'; // We will create this helper

// Helper function to get socket instance (if we need it, which we do!)
// We need to initialize it somewhere first. Let's adjust our strategy slightly.
// The API route itself can't easily emit socket events.
// So, the client will submit, and upon success, the *client* will emit an event.
// This is simpler. Let's stick to a pure API route for now.

export async function POST(request: NextRequest) {
  try {
    const { answers, questions } = await request.json();

    if (!answers || !questions) {
      return NextResponse.json({ message: "Missing answers or questions" }, { status: 400 });
    }

    let score = 0;
    questions.forEach((question: any, index: number) => {
      if (answers[index] && answers[index] === question.correctAnswer) {
        score++;
      }
    });

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    
    // The server calculates the score and sends it back to the client that submitted it.
    return NextResponse.json({
      score,
      totalQuestions,
      percentage,
    });

  } catch (error) {
    console.error('Quiz Submission Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}