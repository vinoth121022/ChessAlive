export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export interface Square {
  file: string;
  rank: number;
  notation: string;
}

export interface Move {
  from: string;
  to: string;
  promotion?: string;
}

export interface Player {
  id: string;
  username: string;
  rating: number;
}

export interface GameState {
  id: string;
  fen: string;
  pgn: string;
  status: 'WAITING' | 'ACTIVE' | 'FINISHED' | 'ABANDONED';
  result?: 'WHITE_WIN' | 'BLACK_WIN' | 'DRAW';
  white: Player;
  black: Player;
  timeControl: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  rating: number;
}
