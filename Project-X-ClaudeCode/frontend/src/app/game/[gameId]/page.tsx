'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChessBoard from '@/components/board/ChessBoard';
import PlayerInfo from '@/components/game/PlayerInfo';
import MoveHistory from '@/components/game/MoveHistory';
import GameControls from '@/components/game/GameControls';
import { useChessGame } from '@/hooks/useChessGame';
import { api } from '@/lib/api';
import { GameState } from '@/types/chess';

export default function GamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const [userId, setUserId] = useState('');
  const [initialGame, setInitialGame] = useState<GameState | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUserId(JSON.parse(stored).id);
    api.games.get(gameId).then((g: any) => setInitialGame(g)).catch(console.error);
  }, [gameId]);

  const { game, chess, selectedSquare, legalMoves, selectSquare, resign, offerDraw } = useChessGame(gameId, userId);
  const activeGame = game || initialGame;

  if (!activeGame) return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;

  const playerColor = activeGame.white.id === userId ? 'w' : 'b';

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-6 p-6 min-h-[calc(100vh-64px)]">
      <div className="flex flex-col gap-2">
        <PlayerInfo player={activeGame.black} color="b" />
        <ChessBoard chess={chess} selectedSquare={selectedSquare} legalMoves={legalMoves} onSquareClick={selectSquare} flipped={playerColor === 'b'} />
        <PlayerInfo player={activeGame.white} color="w" />
      </div>
      <div className="flex flex-col gap-4 w-full lg:w-72">
        <MoveHistory pgn={activeGame.pgn} />
        <GameControls onResign={resign} onOfferDraw={offerDraw} gameStatus={activeGame.status} />
      </div>
    </div>
  );
}
