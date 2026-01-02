import { prisma, disconnectDb, checkDbConnection } from './prisma';

/**
 * Database utilities and helpers
 */

/**
 * Transaction wrapper for database operations
 * 
 * @example
 * ```typescript
 * const result = await withTransaction(async (tx) => {
 *   const user = await tx.user.create({ data: { email: 'test@example.com' } });
 *   const profile = await tx.profile.create({ data: { userId: user.id } });
 *   return { user, profile };
 * });
 * ```
 */
export async function withTransaction<T>(
  fn: (tx: typeof prisma) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return fn(tx as typeof prisma);
  });
}

/**
 * Pagination helper
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Create pagination parameters for Prisma queries
 */
export function getPaginationParams(options: PaginationOptions = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit };
}

/**
 * Format paginated response
 */
export function formatPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

// Re-export prisma utilities
export { prisma, disconnectDb, checkDbConnection };
