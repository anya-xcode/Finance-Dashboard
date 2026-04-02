// ============================================
// UserController — Handles user management HTTP requests
// ============================================

import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { ApiResponse } from '../utils/ApiResponse';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /** GET /api/users */
  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json(ApiResponse.success(users));
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/users/:id */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.status(200).json(ApiResponse.success(user));
    } catch (error) {
      next(error);
    }
  };

  /** PATCH /api/users/:id */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      res.status(200).json(ApiResponse.success(user, 'User updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  /** DELETE /api/users/:id */
  deactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.userService.deactivateUser(req.params.id);
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };
}
