"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const os_1 = __importDefault(require("os"));
const rate_limiter_1 = require("./middleware/rate-limiter");
const error_middleware_1 = require("./middleware/error.middleware");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_spec_1 = __importDefault(require("../config/swagger-spec"));
const prisma_1 = require("../config/prisma");
const app = (0, express_1.default)();
// Global Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Swagger API Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_spec_1.default));
// Apply rate limiting
app.use(rate_limiter_1.globalLimiter);
// Comprehensive Health Check Endpoint
app.get('/api/v1/health', async (_req, res) => {
    const startTime = Date.now();
    // --- Database Health ---
    let dbStatus = 'DOWN';
    let dbLatencyMs = null;
    let dbError = null;
    try {
        const dbStart = Date.now();
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        dbLatencyMs = Date.now() - dbStart;
        dbStatus = 'UP';
    }
    catch (err) {
        dbError = err.message || 'Unknown database error';
    }
    // --- Memory / RAM ---
    const memUsage = process.memoryUsage();
    const totalSystemMemory = os_1.default.totalmem();
    const freeSystemMemory = os_1.default.freemem();
    // --- Overall status ---
    const overallStatus = dbStatus === 'UP' ? 'UP' : 'DEGRADED';
    res.status(overallStatus === 'UP' ? 200 : 503).json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
        server: {
            uptime: process.uptime(),
            uptimeFormatted: formatUptime(process.uptime()),
            nodeVersion: process.version,
            pid: process.pid,
            environment: process.env.NODE_ENV || 'development',
        },
        database: {
            status: dbStatus,
            latencyMs: dbLatencyMs,
            ...(dbError && { error: dbError }),
        },
        memory: {
            process: {
                rss: formatBytes(memUsage.rss),
                heapTotal: formatBytes(memUsage.heapTotal),
                heapUsed: formatBytes(memUsage.heapUsed),
                external: formatBytes(memUsage.external),
            },
            system: {
                total: formatBytes(totalSystemMemory),
                free: formatBytes(freeSystemMemory),
                used: formatBytes(totalSystemMemory - freeSystemMemory),
                usagePercent: ((1 - freeSystemMemory / totalSystemMemory) * 100).toFixed(1) + '%',
            },
        },
        system: {
            platform: os_1.default.platform(),
            arch: os_1.default.arch(),
            hostname: os_1.default.hostname(),
            cpuCores: os_1.default.cpus().length,
            loadAverage: os_1.default.loadavg().map((l) => l.toFixed(2)),
        },
    });
});
/** Format bytes into a human-readable string (e.g. 128.50 MB) */
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
}
/** Format seconds into a human-readable uptime string */
function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0)
        parts.push(`${d}d`);
    if (h > 0)
        parts.push(`${h}h`);
    if (m > 0)
        parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
}
// Routing configurations
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const events_routes_1 = __importDefault(require("./routes/events.routes"));
const bookings_routes_1 = __importDefault(require("./routes/bookings.routes"));
const webhooks_routes_1 = __importDefault(require("./routes/webhooks.routes"));
const reviews_routes_1 = __importDefault(require("./routes/reviews.routes"));
const boosted_events_routes_1 = __importDefault(require("./routes/boosted-events.routes"));
const integrations_routes_1 = __importDefault(require("./routes/integrations.routes"));
const wishlist_routes_1 = __importDefault(require("./routes/wishlist.routes"));
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/notifications', notifications_routes_1.default);
app.use('/api/v1/hosts', users_routes_1.default);
app.use('/api/v1/events', events_routes_1.default);
app.use('/api/v1/bookings', bookings_routes_1.default);
app.use('/api/v1/webhooks', webhooks_routes_1.default);
app.use('/api/v1/reviews', reviews_routes_1.default);
app.use('/api/v1/boosted-events', boosted_events_routes_1.default);
app.use('/api/v1/integrations', integrations_routes_1.default);
app.use('/api/v1/wishlist', wishlist_routes_1.default);
// Catch-all route for undefined endpoints
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Cannot ${req.method} ${req.path}`,
        },
    });
});
// Global Error Handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
