import { Server, Socket } from 'socket.io';
import { makeMove, resignGame, createGame } from '../services/gameService';
import { MovePayload } from '../types';

export function registerGameHandlers(io: Server, socket: Socket): void {
  socket.on('game:join', (gameId: string) => {
    socket.join(gameId);
    socket.to(gameId).emit('game:opponent_joined');
  });

  socket.on('game:move', async (payload: MovePayload) => {
    try {
      const updatedGame = await makeMove(payload);
      io.to(payload.gameId).emit('game:update', updatedGame);
    } catch (err: any) {
      socket.emit('game:error', { message: err.message });
    }
  });

  socket.on('game:resign', async ({ gameId, userId }: { gameId: string; userId: string }) => {
    try {
      const updatedGame = await resignGame(gameId, userId);
      io.to(gameId).emit('game:update', updatedGame);
      io.to(gameId).emit('game:ended', { result: updatedGame.result });
    } catch (err: any) {
      socket.emit('game:error', { message: err.message });
    }
  });

  socket.on('game:create', async ({ whiteId, blackId, timeControl }: { whiteId: string; blackId: string; timeControl?: number }) => {
    try {
      const game = await createGame(whiteId, blackId, timeControl);
      socket.emit('game:created', game);
    } catch (err: any) {
      socket.emit('game:error', { message: err.message });
    }
  });

  socket.on('game:draw_offer', ({ gameId }: { gameId: string }) => {
    socket.to(gameId).emit('game:draw_offered');
  });

  socket.on('game:draw_accept', async ({ gameId }: { gameId: string }) => {
    // Draw acceptance logic can be added here
    io.to(gameId).emit('game:ended', { result: 'DRAW' });
  });
}
