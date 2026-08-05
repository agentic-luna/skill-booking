export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Safely parses `page` and `limit` from request query params with upper and lower bounds.
 */
export function parsePaginationParams(query: any, defaultLimit: number = 10): { page: number; limit: number; skip: number } {
  const parsedPage = parseInt(String(query?.page || '1'), 10);
  const parsedLimit = parseInt(String(query?.limit || defaultLimit), 10);

  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);
  const limit = Math.min(100, Math.max(1, isNaN(parsedLimit) ? defaultLimit : parsedLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Constructs a standardized paginated response object.
 */
export function buildPaginatedResponse<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
