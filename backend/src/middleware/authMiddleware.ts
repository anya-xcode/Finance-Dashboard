// ============================================
// Auth Middleware — Verifies JWT tokens
// ============================================
// Extracts the token from the Authorization header,
// verifies it, and attaches the user info to req.user.

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories';
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
const userRepo = new UserRepository();

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    // LIVE ROLE DETECTION: Fetch the latest user data from DB
    // This ensures permissions update instantly even if the JWT remains stale.
    const user = await userRepo.findById(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account has been deactivated');
    }

    // Attach latest info to the request object
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    
    next();
  } catch (error) {
    next(error);
  }
};
