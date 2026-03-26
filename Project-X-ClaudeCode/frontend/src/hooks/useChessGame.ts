'use client';
import { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { GameState, Move } from '@/types/chess';
import { useSocket } from './useSocket';

export function useChessGame(gameId: string, userId: string) {
  const socket = useSocket();
  const [game, setGame] = useState<GameState | null>(null);
  const [chess] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  useEffect(() => {
    socket.emit('game:join', gameId);
    socket.on('game:update', (updatedGame: GameState) => {
      setGame(updatedGame);
      chess.load(updatedGame.fen);
    });
    socket.on('game:opponent_joined', () => console.log('Opponent joined'));
    return () => {
      socket.off('game:update');
      socket.off('game:opponent_joined');
    };
  }, [gameId, socket, chess]);

  const selectSquare = useCallback((square: string) => {
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }
    if (selectedSquare && legalMoves.includes(square)) {
      const move: Move = { from: selectedSquare, to: square };
      socket.emit('game:move', { gameId, ...move });
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }
    const piece = chess.get(square as any);
    if (piece) {
      setSelectedSquare(square);
      const moves = chess.moves({ square: square as any, verbose: true });
      setLegalMoves(moves.map((m: any) => m.to));
    }
  }, [selectedSquare, legalMoves, chess, socket, gameId]);

  const resign = useCallback(() => {
    socket.emit('game:resign', { gameId, userId });
  }, [socket, gameId, userId]);

  const offerDraw = useCallback(() => {
    socket.emit('game:draw_offer', { gameId });
  }, [socket, gameId]);

  return { game, chess, selectedSquare, legalMoves, selectSquare, resign, offerDraw };
}
