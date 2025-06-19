import { useAuthStore } from "@/app/store/useAuthStore";

// This is a helper to centralize API calls and automatically add the auth token.
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as any).Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'API request failed');
  }

  return response.json();
}

// Auth APIs
export const registerUser = (data: any) => fetchWithAuth('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const loginUser = (data: Record<string, unknown>) => fetchWithAuth('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });

// Interview APIs
export const createInterview = (data: any) => fetchWithAuth('/api/interview/create', { method: 'POST', body: JSON.stringify(data) });
export const endInterview = (roomCode: string) => fetchWithAuth('/api/interview/end', { method: 'POST', body: JSON.stringify({ roomCode }) });
export const getStreamToken = (userId: string, roomCode: string) => fetchWithAuth('/api/stream/token', { method: 'POST', body: JSON.stringify({ userId, roomCode }) });

// Quiz API
export const generateQuizQuestions = (data: any) => fetchWithAuth('/api/quiz/generate', { method: 'POST', body: JSON.stringify(data) });
export const verifyRoom = (roomCode: string) => fetchWithAuth('/api/interview/verify-room', { method: 'POST', body: JSON.stringify({ roomCode }) });

export const getInterviewHistory = () => fetchWithAuth('/api/interview/history', { method: 'GET' });