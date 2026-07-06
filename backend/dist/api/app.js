"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const rate_limiter_1 = require("./middleware/rate-limiter");
const error_middleware_1 = require("./middleware/error.middleware");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_spec_1 = __importDefault(require("../config/swagger-spec"));
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
// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
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
