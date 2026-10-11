import { Router } from 'express';
import { register, login, guestLogin, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/guest', guestLogin);
router.get('/me', authenticate, getMe);

export default router;
