"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinstonLoggerService = void 0;
const winston_1 = __importDefault(require("winston"));
class WinstonLoggerService {
    logger;
    constructor() {
        this.logger = winston_1.default.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json()),
            defaultMeta: { service: 'skill-booking-backend' },
            transports: [
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ timestamp, level, message, meta, stack }) => {
                        const metaString = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                        const stackString = stack ? `\n${stack}` : '';
                        return `[${timestamp}] ${level}: ${message}${metaString}${stackString}`;
                    })),
                }),
            ],
        });
    }
    info(message, meta) {
        this.logger.info(message, { meta });
    }
    warn(message, meta) {
        this.logger.warn(message, { meta });
    }
    error(message, error, meta) {
        const stack = error instanceof Error ? error.stack : undefined;
        const errMsg = error instanceof Error ? error.message : (error ? String(error) : '');
        const fullMessage = errMsg ? `${message} - Error: ${errMsg}` : message;
        this.logger.error(fullMessage, { stack, meta });
    }
    debug(message, meta) {
        this.logger.debug(message, { meta });
    }
}
exports.WinstonLoggerService = WinstonLoggerService;
