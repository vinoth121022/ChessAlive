import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getGame, getMyGames } from '../controllers/gameController';

const router = Router();

router.get('/my', authMiddleware, getMyGames);
router.get('/:gameId', authMiddleware, getGame);

export default router;
