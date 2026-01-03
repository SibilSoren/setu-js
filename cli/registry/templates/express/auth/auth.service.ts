import bcrypt from 'bcryptjs';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyToken,
  type TokenPayload 
} from './auth.middleware';

// Types
export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// Constants
const SALT_ROUNDS = 12;

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate auth tokens for a user
 */
export function generateAuthTokens(user: UserData): AuthTokens {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Refresh access token using refresh token
 */
export function refreshAccessToken(refreshToken: string): AuthTokens {
  const payload = verifyToken(refreshToken);
  
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Example: Register a new user
 * 
 * NOTE: This is a template. You need to implement your own user storage logic.
 * Replace the TODO comments with your database operations.
 */
export async function registerUser(input: RegisterInput): Promise<UserData> {
  const { email, password, name } = input;

  // TODO: Check if user already exists in your database
  // const existingUser = await prisma.user.findUnique({ where: { email } });
  // if (existingUser) throw new ConflictError('Email already registered');

  // Hash password
  const hashedPassword = await hashPassword(password);

  // TODO: Create user in your database
  // const user = await prisma.user.create({
  //   data: { email, password: hashedPassword, name }
  // });

  // Placeholder - replace with actual user creation
  const user: UserData = {
    id: 'user_' + Date.now(), // Replace with actual ID
    email,
    name,
  };

  return user;
}

/**
 * Example: Login user
 * 
 * NOTE: This is a template. Implement your own user lookup logic.
 */
export async function loginUser(
  input: LoginInput
): Promise<{ user: UserData; tokens: AuthTokens }> {
  const { email, password } = input;

  // TODO: Find user by email in your database
  // const user = await prisma.user.findUnique({ where: { email } });
  // if (!user) throw new UnauthorizedError('Invalid credentials');

  // TODO: Verify password
  // const isValid = await comparePassword(password, user.password);
  // if (!isValid) throw new UnauthorizedError('Invalid credentials');

  // Placeholder - replace with actual user lookup
  const user: UserData = {
    id: 'user_1',
    email,
    name: 'User',
  };

  const tokens = generateAuthTokens(user);

  return { user, tokens };
}
