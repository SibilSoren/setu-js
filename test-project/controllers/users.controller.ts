import type { Request, Response } from 'express';
import { z } from 'zod';
import * as usersService from '../services/users.service';
import { asyncHandler } from '../lib/yantr/error-handler';
import { NotFoundError } from '../lib/yantr/error-handler';

/**
 * Users Controller
 * 
 * Request handlers for users endpoints.
 */

// Validation schemas
export const createUsersSchema = z.object({
  // Add your validation rules here
});

export const updateUsersSchema = z.object({
  // Add your validation rules here
});

/**
 * GET /api/users
 * Get all userss
 */
export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const items = await usersService.getAll();
  
  res.json({
    success: true,
    data: items,
  });
});

/**
 * GET /api/users/:id
 * Get users by ID
 */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await usersService.getById(id);
  
  if (!item) {
    throw new NotFoundError('Users not found');
  }
  
  res.json({
    success: true,
    data: item,
  });
});

/**
 * POST /api/users
 * Create a new users
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createUsersSchema.parse(req.body);
  const item = await usersService.create(input);
  
  res.status(201).json({
    success: true,
    data: item,
    message: 'Users created successfully',
  });
});

/**
 * PUT /api/users/:id
 * Update users by ID
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const input = updateUsersSchema.parse(req.body);
  const item = await usersService.update(id, input);
  
  res.json({
    success: true,
    data: item,
    message: 'Users updated successfully',
  });
});

/**
 * DELETE /api/users/:id
 * Delete users by ID
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await usersService.remove(id);
  
  res.json({
    success: true,
    message: 'Users deleted successfully',
  });
});
