// ============================================
// Enums — All constant values used across the app
// ============================================

/** User roles that define access levels */
export enum UserRole {
  ADMIN = 'admin',
  ANALYST = 'analyst',
  VIEWER = 'viewer',
}

/** Types of financial records */
export enum RecordType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

/** Predefined categories for financial records */
export enum RecordCategory {
  SALARY = 'Salary',
  FREELANCE = 'Freelance',
  INVESTMENT = 'Investment',
  RENT = 'Rent',
  FOOD = 'Food',
  TRANSPORT = 'Transport',
  UTILITIES = 'Utilities',
  ENTERTAINMENT = 'Entertainment',
  HEALTHCARE = 'Healthcare',
  EDUCATION = 'Education',
  SHOPPING = 'Shopping',
  OTHER = 'Other',
}
