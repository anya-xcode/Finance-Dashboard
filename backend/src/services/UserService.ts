// ============================================
// UserService — User management business logic
// ============================================
// Admin-level operations: list users, update roles, deactivate.

import { UserRepository } from '../repositories';
import { UserRole } from '../types/enums';
import { ApiError } from '../utils/ApiError';

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  /** Get all users (admin only) */
  async getAllUsers() {
    const users = await this.userRepo.findAll({});
    // Strip passwords from response
    return users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }));
  }

  /** Get a single user by ID */
  async getUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  /** Update a user's role or status */
  async updateUser(id: string, updates: { role?: UserRole; isActive?: boolean }) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updated = await this.userRepo.updateById(id, updates);
    if (!updated) {
      throw ApiError.internal('Failed to update user');
    }

    return {
      id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      isActive: updated.isActive,
    };
  }

  /** Deactivate a user (soft delete) */
  async deactivateUser(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await this.userRepo.updateById(id, { isActive: false });
    return { message: 'User deactivated successfully' };
  }
}
