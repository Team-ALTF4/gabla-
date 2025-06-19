import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in .env file');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function generateQuiz(topic: string, count: number, directions: string) {
  const prompt = `
    You are an expert quiz generator for a technical interview platform.
    Your response MUST be a valid JSON object, without any markdown formatting like \`\`\`json.
    The JSON object must be an array of question objects. Each question object must have this exact structure:
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The text of the correct option"
    }
    
    Quiz Parameters:
    - Topic: "${topic}"
    - Number of Questions: ${count}
    - Additional Directions: "${directions}"
    
    Generate the quiz now.
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    const quiz = JSON.parse(text);
    return quiz;
  } catch (error) {
    console.error('Error generating quiz from Gemini:', error);
    throw new Error('Failed to generate quiz.');
  }
}