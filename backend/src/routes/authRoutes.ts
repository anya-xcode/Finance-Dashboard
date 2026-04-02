// ============================================
// Auth Routes — /api/auth
// ============================================

import { Router } from 'express';
import { AuthController } from '../controllers';
import { authMiddleware } from '../middleware/authMiddleware';
import { registerValidation, loginValidation } from '../middleware/validate';

const router = Router();
const controller = new AuthController();

// Public routes
router.post('/register', registerValidation, controller.register);
router.post('/login', loginValidation, controller.login);

// Protected route (requires authentication)
router.get('/me', authMiddleware, controller.getMe);

export default router;
