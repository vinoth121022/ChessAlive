import { Chess } from 'chess.js';
import { PrismaClient, GameStatus, GameResult } from '@prisma/client';
import { MovePayload } from '../types';

const prisma = new PrismaClient();

export async function createGame(whiteId: string, blackId: string, timeControl = 600) {
  return prisma.game.create({
    data: { whiteId, blackId, timeControl, status: GameStatus.ACTIVE },
    include: { white: { select: { id: true, username: true, rating: true } }, black: { select: { id: true, username: true, rating: true } } },
  });
}

export async function makeMove(payload: MovePayload) {
  const game = await prisma.game.findUnique({ where: { id: payload.gameId } });
  if (!game || game.status !== GameStatus.ACTIVE) throw new Error('Game not active');

  const chess = new Chess(game.fen);
  const move = chess.move({ from: payload.from, to: payload.to, promotion: payload.promotion });
  if (!move) throw new Error('Illegal move');

  let status = GameStatus.ACTIVE;
  let result: GameResult | undefined;

  if (chess.isCheckmate()) {
    status = GameStatus.FINISHED;
    result = chess.turn() === 'b' ? GameResult.WHITE_WIN : GameResult.BLACK_WIN;
  } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    status = GameStatus.FINISHED;
    result = GameResult.DRAW;
  }

  return prisma.game.update({
    where: { id: payload.gameId },
    data: { fen: chess.fen(), pgn: chess.pgn(), status, result },
  });
}

export async function resignGame(gameId: string, userId: string) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game || game.status !== GameStatus.ACTIVE) throw new Error('Game not active');

  const result = game.whiteId === userId ? GameResult.BLACK_WIN : GameResult.WHITE_WIN;
  return prisma.game.update({
    where: { id: gameId },
    data: { status: GameStatus.FINISHED, result },
  });
}

export async function getGame(gameId: string) {
  return prisma.game.findUnique({
    where: { id: gameId },
    include: {
      white: { select: { id: true, username: true, rating: true } },
      black: { select: { id: true, username: true, rating: true } },
    },
  });
}

export async function getUserGames(userId: string) {
  return prisma.game.findMany({
    where: { OR: [{ whiteId: userId }, { blackId: userId }] },
    include: {
      white: { select: { id: true, username: true, rating: true } },
      black: { select: { id: true, username: true, rating: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}
