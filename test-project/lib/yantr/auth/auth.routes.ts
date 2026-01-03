import { Router } from 'express';
import { 
  register, 
  login, 
  refresh, 
  logout, 
  getMe 
} from './auth.controller';
import { authenticate } from './auth.middleware';
import { validateBody } from '../base/zod-middleware';
import { registerSchema, loginSchema } from './auth.controller';

const router = Router();

/**
 * Auth Routes
 * 
 * POST /api/auth/register - Register new user
 * POST /api/auth/login    - Login user
 * POST /api/auth/refresh  - Refresh access token
 * POST /api/auth/logout   - Logout user
 * GET  /api/auth/me       - Get current user (protected)
 */

// Public routes
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticate, getMe);

export default router;
