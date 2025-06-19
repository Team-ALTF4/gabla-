import { prisma } from '@/lib/prisma';
import { Server, Socket } from 'socket.io';

export const initializeSocketIO = (io: Server) => {
  return io.on('connection', (socket: Socket) => {
    console.log(`- User connected: ${socket.id}`);

    socket.on('join-room', async (roomCode: string, userId: string) => {
      socket.join(roomCode);
      console.log(`> User ${userId} (${socket.id}) joined room: ${roomCode}`);

      // Mark the interview as 'ACTIVE'
      await prisma.interviewSession.updateMany({
        where: { roomCode: roomCode, status: 'PENDING' },
        data: { status: 'ACTIVE' },
      });

      socket.to(roomCode).emit('user-connected', userId);
    });

    socket.on('send-chat-message', (roomCode: string, message: { sender: string; text: string }) => {
      socket.to(roomCode).emit('receive-chat-message', message);
    });

    socket.on('launch-quiz', (roomCode: string, quizData: any) => {
      socket.to(roomCode).emit('quiz-started', quizData);
      console.log(`> Quiz launched in room ${roomCode}`);
    });

    socket.on('push-coding-question', (roomCode: string, questionMarkdown: string) => {
      socket.to(roomCode).emit('receive-coding-question', questionMarkdown);
    });

    socket.on('security-alert', (roomCode: string, alert: { type: string; message: string }) => {
      socket.to(roomCode).emit('receive-security-alert', alert);
      console.log(`🚨 SECURITY ALERT in ${roomCode}: ${alert.type}`);
    });
    socket.on('broadcast-end-session', (roomCode: string) => {
      console.log(`> Server broadcasting end-session for room ${roomCode}`);
      // The server relays the message to everyone in the room.
      io.to(roomCode).emit('interview-ended');
    });

    socket.on('quiz-scored', (roomCode: string, result: { score: number, total: number }) => {
        console.log(`> Quiz result for room ${roomCode}: ${result.score}/${result.total}`);
        const systemMessage = {
            sender: 'System',
            text: `Quiz Result: Interviewee scored ${result.score}/${result.total}.`,
        };
        io.to(roomCode).emit('receive-chat-message', systemMessage);
    });
    socket.on('security-alert', (roomCode: string, alert: { type: string; message: string }) => {
        // --- THIS IS THE NEW LOGIC ---
        console.log(`🚨 SECURITY ALERT in ${roomCode}: ${alert.type}`);
        // We re-format this as a system chat message and broadcast it to the room.
        const systemMessage = {
            sender: 'System',
            text: `🚨 ${alert.type}: ${alert.message}`,
        };
        io.to(roomCode).emit('receive-chat-message', systemMessage);
    });

    socket.on('code-submitted', (roomCode: string, code: string) => {
        console.log(`> Code submitted for room ${roomCode}`);
        const systemMessage = {
            sender: 'System',
            text: `--- CODE SUBMISSION ---\n\n${code}`,
        };
        // The server sends the code as a system message in the chat.
        io.to(roomCode).emit('receive-chat-message', systemMessage);
    });

    socket.on('disconnect', () => {
      console.log(`- User disconnected: ${socket.id}`);
    });

  });
};