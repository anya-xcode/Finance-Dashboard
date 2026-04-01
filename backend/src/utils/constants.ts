// ============================================
// Constants — Shared values used across the app
// ============================================

import { UserRole } from '../types/enums';

/** Default pagination values */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/** Role hierarchy — higher number = more permissions */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.VIEWER]: 1,
  [UserRole.ANALYST]: 2,
  [UserRole.ADMIN]: 3,
};
