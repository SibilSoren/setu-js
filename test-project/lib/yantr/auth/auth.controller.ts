import type { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from './auth.middleware';
import { registerUser, loginUser, refreshAccessToken } from './auth.service';
import { asyncHandler } from '../base/error-handler';
import { BadRequestError } from '../base/error-handler';

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = registerSchema.parse(req.body);
  
  const user = await registerUser(validatedData);
  
  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    },
    message: 'Registration successful',
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const validatedData = loginSchema.parse(req.body);
  
  const { user, tokens } = await loginUser(validatedData);

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken: tokens.accessToken,
    },
    message: 'Login successful',
  });
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new BadRequestError('Refresh token required');
  }

  const tokens = refreshAccessToken(refreshToken);

  // Update refresh token cookie
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);

  res.json({
    success: true,
    data: {
      accessToken: tokens.accessToken,
    },
  });
});

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken', COOKIE_OPTIONS);

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * Get current user
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});
