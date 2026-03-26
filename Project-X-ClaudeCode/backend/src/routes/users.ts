import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getProfile, getUser } from '../controllers/userController';

const router = Router();

router.get('/me', authMiddleware, getProfile);
router.get('/:username', getUser);

export default router;
