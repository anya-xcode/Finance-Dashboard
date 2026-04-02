// ============================================
// Validation Middleware — Input validation using express-validator
// ============================================
// Defines validation rules for each route and a middleware
// to check for validation errors before hitting the controller.

import { body, query, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { RecordType, RecordCategory } from '../types/enums';

/** Check for validation errors and return them as a 400 response */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('[ValidationError]', errors.array());
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      data: errors.array().map((err) => ({
        field: (err as any).path,
        message: err.msg,
      })),
    });
    return;
  }
  next();
};

/** Rules for record ID parameter */
export const recordIdValidation = [
  param('id').isMongoId().withMessage('Invalid record ID format'),
  handleValidationErrors,
];

// ---- Validation Rules ----

/** Rules for user registration */
export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

/** Rules for login */
export const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

/** Rules for creating a financial record */
export const createRecordValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('type')
    .isIn(Object.values(RecordType))
    .withMessage(`Type must be one of: ${Object.values(RecordType).join(', ')}`),
  body('category')
    .isIn(Object.values(RecordCategory))
    .withMessage(`Category must be one of: ${Object.values(RecordCategory).join(', ')}`),
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO date (e.g., 2026-01-15)'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  handleValidationErrors,
];

/** Rules for updating a financial record (all fields optional) */
export const updateRecordValidation = [
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('type')
    .optional()
    .isIn(Object.values(RecordType))
    .withMessage(`Type must be one of: ${Object.values(RecordType).join(', ')}`),
  body('category')
    .optional()
    .isIn(Object.values(RecordCategory))
    .withMessage(`Category must be one of: ${Object.values(RecordCategory).join(', ')}`),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  handleValidationErrors,
];

/** Rules for record query filters */
export const recordFilterValidation = [
  query('type')
    .optional({ checkFalsy: true })
    .isIn(Object.values(RecordType))
    .withMessage(`Type must be one of: ${Object.values(RecordType).join(', ')}`),
  query('category')
    .optional({ checkFalsy: true })
    .isIn(Object.values(RecordCategory))
    .withMessage(`Invalid category`),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid date'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];
