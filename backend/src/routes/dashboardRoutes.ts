// ============================================
// Dashboard Routes — /api/dashboard
// ============================================

import { Router } from 'express';
import { DashboardController } from '../controllers';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { UserRole } from '../types/enums';

const router = Router();
const controller = new DashboardController();

// All dashboard routes require authentication
router.use(authMiddleware);

// Recent activity — available to all authenticated users
router.get('/recent-activity', controller.getRecentActivity);

// Analytics — Analyst and Admin only
router.get(
  '/summary',
  roleMiddleware(UserRole.ADMIN, UserRole.ANALYST),
  controller.getSummary
);
router.get(
  '/category-totals',
  roleMiddleware(UserRole.ADMIN, UserRole.ANALYST),
  controller.getCategoryTotals
);
router.get(
  '/monthly-trends',
  roleMiddleware(UserRole.ADMIN, UserRole.ANALYST),
  controller.getMonthlyTrends
);

export default router;
