"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../common/errors");
const di_container_1 = require("../di-container");
const errorHandler = (err, req, res, next) => {
    const isAppError = err instanceof errors_1.AppError;
    const statusCode = isAppError ? err.statusCode : 500;
    const message = err.message || 'Internal Server Error';
    if (err.stack) {
        di_container_1.logger.error(err.stack);
    }
    di_container_1.logger.error(`[API Error] ${statusCode} - ${message}`, err, { path: req.path, method: req.method });
    return res.status(statusCode).json({
        success: false,
        error: {
            message,
            code: isAppError ? err.constructor.name : 'InternalServerError',
            ...(isAppError && err.details ? { details: err.details } : {}),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};
exports.errorHandler = errorHandler;
