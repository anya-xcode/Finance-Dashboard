// ============================================
// AuthService — Authentication business logic
// ============================================
// Handles registration, login, and JWT token management.
// Uses UserRepository for DB access and UserFactory for creation.

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories';
import { UserFactory } from '../factories/UserFactory';
import { CreateUserDTO, LoginDTO, JwtPayload } from '../types/interfaces';
import { ApiError } from '../utils/ApiError';

export class AuthService {
  private userRepo: UserRepository;
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.userRepo = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  /** Register a new user */
  async register(dto: CreateUserDTO) {
    // Check if email already exists
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw ApiError.conflict('Email already registered');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user using factory (applies defaults)
    const userData = UserFactory.create({ ...dto, password: hashedPassword });

    // Save to database
    const user = await this.userRepo.create(userData as any);

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  /** Login with email and password */
  async login(dto: LoginDTO) {
    // Find user by email
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated. Contact an admin.');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(dto.password, user.password);
    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  /** Generate a JWT token */
  private generateToken(user: any): string {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  /** Verify and decode a JWT token */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch {
      throw ApiError.unauthorized('Invalid or expired token');
    }
  }
}
