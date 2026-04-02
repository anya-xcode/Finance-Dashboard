// ============================================
// AuthController — Handles auth-related HTTP requests
// ============================================

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { ApiResponse } from '../utils/ApiResponse';
import { UserRepository } from '../repositories';

export class AuthController {
  private authService: AuthService;
  private userRepo: UserRepository;

  constructor() {
    this.authService = new AuthService();
    this.userRepo = new UserRepository();
  }

  /** POST /api/auth/register */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(ApiResponse.success(result, 'User registered successfully'));
    } catch (error) {
      next(error);
    }
  };

  /** POST /api/auth/login */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(ApiResponse.success(result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/auth/me */
  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userRepo.findById(req.user!.userId);
      if (!user) {
        res.status(404).json(ApiResponse.error('User not found'));
        return;
      }

      res.status(200).json(
        ApiResponse.success({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        })
      );
    } catch (error) {
      next(error);
    }
  };
}
