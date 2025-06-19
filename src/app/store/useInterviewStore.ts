import { create } from 'zustand';

export type Message = {
  sender: string; // 'interviewer' or 'interviewee'
  text: string;
  timestamp: number;
};

type InterviewState = {
  messages: Message[];
  addMessage: (message: Message) => void;
  securityAlerts: { type: string; message: string; timestamp: number }[];
  addSecurityAlert: (alert: { type: string; message: string }) => void;
  clearState: () => void;
};

export const useInterviewStore = create<InterviewState>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  securityAlerts: [],
  addSecurityAlert: (alert) =>
    set((state) => ({
      securityAlerts: [...state.securityAlerts, { ...alert, timestamp: Date.now() }],
    })),
  clearState: () => set({ messages: [], securityAlerts: [] }),
}));