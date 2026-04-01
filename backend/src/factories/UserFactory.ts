// ============================================
// UserFactory — Creates User objects with defaults
// ============================================
// Factory pattern: centralizes object creation logic
// so we don't scatter default values across the codebase.

import { UserRole } from '../types/enums';
import { CreateUserDTO } from '../types/interfaces';

export class UserFactory {
  /** Create a user data object with sensible defaults */
  static create(dto: CreateUserDTO) {
    return {
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
      password: dto.password, // Will be hashed in the service layer
      role: dto.role || UserRole.VIEWER,
      isActive: true,
    };
  }
}
