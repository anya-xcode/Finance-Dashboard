// ============================================
// Interfaces — Shape definitions for data objects
// ============================================

import { UserRole, RecordType } from './enums';

/** Shape of a User document (from MongoDB) */
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Shape of a Financial Record document */
export interface IRecord {
  _id: string;
  amount: number;
  type: RecordType;
  category: string;
  date: Date;
  description: string;
  createdBy: string; // User ID reference
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Data needed to create a new user */
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/** Data needed to create a new financial record */
export interface CreateRecordDTO {
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  description?: string;
}

/** Login credentials */
export interface LoginDTO {
  email: string;
  password: string;
}

/** Filters for querying records */
export interface RecordFilters {
  type?: RecordType;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/** Dashboard summary response */
export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  recordCount: number;
}

/** Category-wise totals */
export interface CategoryTotal {
  category: string;
  total: number;
  count: number;
}

/** Monthly trend data point */
export interface MonthlyTrend {
  month: string; // e.g. "2026-01"
  income: number;
  expense: number;
}

/** Standard paginated response */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** JWT payload */
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}
