'use client';

interface Piece {
  type: string;
  color: string;
}

interface Props {
  square: string;
  isLight: boolean;
  piece: Piece | null | false;
  isSelected: boolean;
  isLegalMove: boolean;
  onClick: () => void;
}

export default function ChessSquare({ isLight, piece, isSelected, isLegalMove, onClick }: Props) {
  let bg = isLight ? 'bg-board-light' : 'bg-board-dark';
  if (isSelected) bg = 'bg-board-selected';

  return (
    <div className={`${bg} flex items-center justify-center cursor-pointer relative w-full h-full`} onClick={onClick}>
      {isLegalMove && (
        <div className={`absolute ${piece ? 'inset-0 border-4 border-board-move rounded-sm opacity-70' : 'w-4 h-4 bg-board-move rounded-full opacity-50'}`} />
      )}
      {piece && (
        <span className="text-3xl select-none z-10 drop-shadow">
          {getPieceSymbol(piece.type, piece.color)}
        </span>
      )}
    </div>
  );
}

function getPieceSymbol(type: string, color: string): string {
  const symbols: Record<string, { w: string; b: string }> = {
    k: { w: '♔', b: '♚' },
    q: { w: '♕', b: '♛' },
    r: { w: '♖', b: '♜' },
    b: { w: '♗', b: '♝' },
    n: { w: '♘', b: '♞' },
    p: { w: '♙', b: '♟' },
  };
  return symbols[type]?.[color as 'w' | 'b'] ?? '';
}
