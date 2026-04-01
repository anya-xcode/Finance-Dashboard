// ============================================
// UserRepository — Data access for Users
// ============================================

import { BaseRepository } from './BaseRepository';
import { UserModel, IUserDocument } from '../models';

export class UserRepository extends BaseRepository<IUserDocument> {
  constructor() {
    super(UserModel);
  }

  /** Find a user by email (for login) */
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.findOne({ email: email.toLowerCase() });
  }

  /** Get all active users */
  async findActiveUsers(): Promise<IUserDocument[]> {
    return this.findAll({ isActive: true });
  }
}
