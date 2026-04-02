// ============================================
// User Routes — /api/users (Admin only)
// ============================================

import { Router } from 'express';
import { UserController } from '../controllers';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { UserRole } from '../types/enums';

const router = Router();
const controller = new UserController();

// All user management routes require Admin role
router.use(authMiddleware);
router.use(roleMiddleware(UserRole.ADMIN));

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.patch('/:id', controller.update);
router.delete('/:id', controller.deactivate);

export default router;
