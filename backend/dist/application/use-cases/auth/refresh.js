"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenCommandHandler = exports.RefreshTokenCommand = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../../../config/environment");
const errors_1 = require("../../common/errors");
const system_roles_1 = require("../../../security/system.roles");
class RefreshTokenCommand {
    oldRefreshToken;
    __tag = 'RefreshTokenCommand';
    constructor(oldRefreshToken) {
        this.oldRefreshToken = oldRefreshToken;
    }
}
exports.RefreshTokenCommand = RefreshTokenCommand;
class RefreshTokenCommandHandler {
    userRepo;
    cacheService;
    constructor(userRepo, cacheService) {
        this.userRepo = userRepo;
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { oldRefreshToken } = command;
        try {
            const decoded = jsonwebtoken_1.default.verify(oldRefreshToken, environment_1.env.JWT_SECRET);
            const cacheKey = `auth:refresh_tokens:${decoded.id}:${oldRefreshToken}`;
            const exists = await this.cacheService.get(cacheKey);
            if (!exists) {
                throw new errors_1.UnauthorizedError('Invalid or revoked refresh token');
            }
            const user = await this.userRepo.findById(decoded.id);
            if (!user || user.deletedAt || user.status === 'SUSPENDED') {
                throw new errors_1.UnauthorizedError('User account is invalid or suspended');
            }
            // Revoke the old token
            await this.cacheService.del(cacheKey);
            const permissions = (0, system_roles_1.getPermissionsForRole)(user.role);
            const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, permissions }, environment_1.env.JWT_SECRET, { expiresIn: '15m' });
            const newRefreshToken = jsonwebtoken_1.default.sign({ id: user.id }, environment_1.env.JWT_SECRET, { expiresIn: '7d' });
            const newCacheKey = `auth:refresh_tokens:${user.id}:${newRefreshToken}`;
            await this.cacheService.set(newCacheKey, '1', 7 * 24 * 60 * 60);
            return {
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    status: user.status,
                },
                accessToken,
                refreshToken: newRefreshToken,
            };
        }
        catch (e) {
            const err = new Error(e.message || 'Invalid refresh token');
            err.statusCode = 401;
            throw err;
        }
    }
}
exports.RefreshTokenCommandHandler = RefreshTokenCommandHandler;
