'use client';
import { Chess } from 'chess.js';
import ChessSquare from './ChessSquare';

interface Props {
  chess: Chess;
  selectedSquare: string | null;
  legalMoves: string[];
  onSquareClick: (square: string) => void;
  flipped?: boolean;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

export default function ChessBoard({ chess, selectedSquare, legalMoves, onSquareClick, flipped = false }: Props) {
  const ranks = flipped ? [...RANKS].reverse() : RANKS;
  const files = flipped ? [...FILES].reverse() : FILES;

  return (
    <div className="border-2 border-gray-600 rounded overflow-hidden" style={{ width: '480px', height: '480px' }}>
      <div className="grid grid-cols-8 w-full h-full">
        {ranks.map(rank =>
          files.map(file => {
            const square = `${file}${rank}`;
            const isLight = (FILES.indexOf(file) + rank) % 2 === 0;
            const piece = chess.get(square as any);
            return (
              <ChessSquare
                key={square}
                square={square}
                isLight={isLight}
                piece={piece}
                isSelected={selectedSquare === square}
                isLegalMove={legalMoves.includes(square)}
                onClick={() => onSquareClick(square)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
