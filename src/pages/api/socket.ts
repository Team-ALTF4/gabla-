import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { initializeSocketIO } from '@/sockets';

export type NextApiResponseServerIo = NextApiResponse & {
  socket: { server: NetServer & { io: ServerIO } };
};

export const config = { api: { bodyParser: false } };

export default function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
  if (!res.socket.server.io) {
    console.log('🔌 New Socket.IO server initializing...');
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: { origin: process.env.NEXT_PUBLIC_CLIENT_URL, methods: ['GET', 'POST'] },
    });
    res.socket.server.io = io;
    initializeSocketIO(io);
  }
  res.end();
}