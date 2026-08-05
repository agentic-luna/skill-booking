"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaginationParams = parsePaginationParams;
exports.buildPaginatedResponse = buildPaginatedResponse;
/**
 * Safely parses `page` and `limit` from request query params with upper and lower bounds.
 */
function parsePaginationParams(query, defaultLimit = 10) {
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
function buildPaginatedResponse(data, total, page, limit) {
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
