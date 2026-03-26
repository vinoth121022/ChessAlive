import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export interface JwtPayload {
  userId: string;
}

export interface MovePayload {
  gameId: string;
  from: string;
  to: string;
  promotion?: string;
}

export interface GameRoom {
  gameId: string;
  whiteSocketId?: string;
  blackSocketId?: string;
}
