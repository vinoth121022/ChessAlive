import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { registerGameHandlers } from './gameHandler';

export function initializeSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    registerGameHandlers(io, socket);
    socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
  });

  return io;
}
