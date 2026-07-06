"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutCommandHandler = exports.LogoutCommand = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../../../config/environment");
class LogoutCommand {
    refreshToken;
    __tag = 'LogoutCommand';
    constructor(refreshToken) {
        this.refreshToken = refreshToken;
    }
}
exports.LogoutCommand = LogoutCommand;
class LogoutCommandHandler {
    cacheService;
    constructor(cacheService) {
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { refreshToken } = command;
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, environment_1.env.JWT_SECRET);
            const cacheKey = `auth:refresh_tokens:${decoded.id}:${refreshToken}`;
            await this.cacheService.del(cacheKey);
            return { success: true, message: 'Logged out successfully' };
        }
        catch (e) {
            return { success: true, message: 'Logged out successfully' };
        }
    }
}
exports.LogoutCommandHandler = LogoutCommandHandler;
