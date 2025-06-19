import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useInterviewStore, Message } from '@/app/store/useInterviewStore';
import { useAuthStore } from '@/app/store/useAuthStore';
import { toast } from 'sonner';

export const useSocket = (roomCode: string) => {
  const socketRef = useRef<Socket | null>(null);
  const addMessage = useInterviewStore((state) => state.addMessage);
  const addSecurityAlert = useInterviewStore((state) => state.addSecurityAlert);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return;

    // Connect to the socket server
    const socket = io(process.env.NEXT_PUBLIC_CLIENT_URL!, {
      path: '/api/socket',
      addTrailingSlash: false,
    });
    socketRef.current = socket;

    // --- Event Listeners ---
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      socket.emit('join-room', roomCode, user.id);
    });

    socket.on('receive-chat-message', (message: Omit<Message, 'timestamp'>) => {
      addMessage({ ...message, timestamp: Date.now() });
    });

    socket.on('receive-security-alert', (alert: { type: string; message: string }) => {
      addSecurityAlert(alert);
      toast.error(`🚨 Security Alert: ${alert.type}`, {
        description: alert.message,
        duration: 10000,
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    // --- Cleanup ---
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomCode, user, addMessage, addSecurityAlert]);

  // --- Emitter Functions ---
  const sendMessage = (text: string) => {
    if (socketRef.current && user) {
      const message = { sender: user.id, text };
      socketRef.current.emit('send-chat-message', roomCode, message);
      // Also add own message to the store
      addMessage({ ...message, sender: 'interviewer', timestamp: Date.now() });
    }
  };

  const pushCodingQuestion = (markdown: string) => {
    if (socketRef.current) {
      socketRef.current.emit('push-coding-question', roomCode, markdown);
      toast.success("Coding question sent to interviewee.");
    }
  };
  
  const launchQuiz = (quizData: any) => {
    if (socketRef.current) {
        socketRef.current.emit('launch-quiz', roomCode, quizData);
        toast.info("Quiz has been launched for the interviewee.");
    }
  };

  const endInterviewSession = () => {
    if (socketRef.current) {
      console.log(`> Emitting interview-ended for room: ${roomCode}`);
      // Broadcast to everyone in the room (including self, which is fine)
      socketRef.current.emit('broadcast-end-session', roomCode);
    }
  }

  return { sendMessage, pushCodingQuestion, launchQuiz,  endInterviewSession };
};