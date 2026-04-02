// ============================================
// Role Middleware — Strategy Pattern for access control
// ============================================
// Uses the Strategy pattern: each set of allowed roles
// defines a "strategy" for who can access a route.
//
// Usage in routes:
//   router.get('/admin-only', authMiddleware, roleMiddleware('admin'), handler);
//   router.get('/analysts',   authMiddleware, roleMiddleware('admin', 'analyst'), handler);

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/enums';
import { ApiError } from '../utils/ApiError';

/**
 * Creates a middleware that only allows users with specific roles.
 * @param allowedRoles - The roles that can access this route
 */
export const roleMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // User must be authenticated first (authMiddleware should run before this)
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      // Check if user's role is in the allowed list
      const userRole = (req.user.role as string).toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

      console.log(`[RoleMiddleware] Access Attempt: UserRole=${userRole}, AllowedRoles=${normalizedAllowedRoles}`);

      if (!normalizedAllowedRoles.includes(userRole)) {
        throw ApiError.forbidden(
          `Permission Denied. Required: ${allowedRoles.join('/')}. Identified as: ${userRole}. If you recently changed your role, please log out and back in.`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
