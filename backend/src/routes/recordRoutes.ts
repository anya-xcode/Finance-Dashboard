// ============================================
// Record Routes — /api/records
// ============================================

import { Router } from 'express';
import { RecordController } from '../controllers';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { UserRole } from '../types/enums';
import {
  createRecordValidation,
  updateRecordValidation,
  recordFilterValidation,
} from '../middleware/validate';

const router = Router();
const controller = new RecordController();

// All record routes require authentication
router.use(authMiddleware);

// Read operations — available to all authenticated users
router.get('/', recordFilterValidation, controller.getAll);
router.get('/:id', controller.getById);

// Write operations — Admin only
router.post('/', roleMiddleware(UserRole.ADMIN), createRecordValidation, controller.create);
router.patch('/:id', roleMiddleware(UserRole.ADMIN), updateRecordValidation, controller.update);
router.delete('/:id', roleMiddleware(UserRole.ADMIN), controller.delete);

export default router;
