// src/lib/socket-helper.ts
import { Server } from 'socket.io';
import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';

// This is a global cache for the IO server
let io: Server | undefined;

export const initSocketIO = (res: NextApiResponse) => {
    const server = (res.socket as any).server as NetServer & { io?: Server };
    if (!server.io) {
        console.log("Initializing new Socket.IO server...");
        const newIo = new Server(server, {
            path: "/api/socket",
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXT_PUBLIC_CLIENT_URL,
                methods: ["GET", "POST"],
            },
        });
        server.io = newIo;
        io = newIo;
    }
    return server.io;
};

export const getIO = () => {
    if (!io) {
        // This should not happen in a normal flow where an API call has been made
        console.warn("Socket.IO server not initialized!");
    }
    return io;
};