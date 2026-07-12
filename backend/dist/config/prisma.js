"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const environment_1 = require("./environment");
// Helper to construct database URL with connection limit if not specified
const getDatabaseUrl = () => {
    const baseUrl = environment_1.env.DATABASE_URL;
    if (!baseUrl)
        return undefined;
    // If connection_limit is already specified in the URL, return as is
    if (baseUrl.includes('connection_limit=')) {
        return baseUrl;
    }
    // Add a default connection limit for standard pooling to prevent connection leaks
    // Default to 10 connections, or use environment variable if defined
    const limit = process.env.DATABASE_POOL_SIZE || '10';
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}connection_limit=${limit}`;
};
const prismaClientSingleton = () => {
    const dbUrl = getDatabaseUrl();
    return new client_1.PrismaClient({
        datasources: dbUrl
            ? {
                db: {
                    url: dbUrl,
                },
            }
            : undefined,
        log: environment_1.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
};
exports.prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (environment_1.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = exports.prisma;
}
