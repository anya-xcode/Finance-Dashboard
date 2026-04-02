// ============================================
// Auth Middleware — Verifies JWT tokens
// ============================================
// Extracts the token from the Authorization header,
// verifies it, and attaches the user info to req.user.

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { ApiError } from '../utils/ApiError';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

const authService = new AuthService();

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    // Get token from header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    // Attach user info to the request object
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
