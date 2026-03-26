import { Response } from 'express';
import { AuthRequest } from '../types';
import * as gameService from '../services/gameService';

export async function getGame(req: AuthRequest, res: Response): Promise<void> {
  try {
    const game = await gameService.getGame(req.params.gameId);
    if (!game) { res.status(404).json({ error: 'Game not found' }); return; }
    res.json(game);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getMyGames(req: AuthRequest, res: Response): Promise<void> {
  try {
    const games = await gameService.getUserGames(req.userId!);
    res.json(games);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
