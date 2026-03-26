interface Props {
  type: string;
  color: string;
}

export default function ChessPiece({ type, color }: Props) {
  const symbols: Record<string, { w: string; b: string }> = {
    k: { w: '♔', b: '♚' },
    q: { w: '♕', b: '♛' },
    r: { w: '♖', b: '♜' },
    b: { w: '♗', b: '♝' },
    n: { w: '♘', b: '♞' },
    p: { w: '♙', b: '♟' },
  };
  return <span className="text-3xl select-none">{symbols[type]?.[color as 'w' | 'b'] ?? ''}</span>;
}
