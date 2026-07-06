"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminLoginCommandHandler = exports.AdminLoginCommand = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const environment_1 = require("../../../config/environment");
const system_roles_1 = require("../../../security/system.roles");
const errors_1 = require("../../common/errors");
class AdminLoginCommand {
    identifier;
    passwordText;
    ipAddress;
    __tag = 'AdminLoginCommand';
    constructor(identifier, passwordText, ipAddress) {
        this.identifier = identifier;
        this.passwordText = passwordText;
        this.ipAddress = ipAddress;
    }
}
exports.AdminLoginCommand = AdminLoginCommand;
class AdminLoginCommandHandler {
    userRepo;
    cacheService;
    constructor(userRepo, cacheService) {
        this.userRepo = userRepo;
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { identifier, passwordText, ipAddress } = command;
        if (!identifier || !passwordText) {
            throw new errors_1.BadRequestError('Admin email/identifier and password are required');
        }
        let user = await this.userRepo.findByEmail(identifier);
        if (!user) {
            user = await this.userRepo.findByPhone(identifier);
        }
        if (!user || user.deletedAt) {
            throw new errors_1.BadRequestError('Invalid admin credentials');
        }
        // Security Gate: Verify account has SUPERADMIN role
        if (user.role !== client_1.UserRole.SUPERADMIN) {
            throw new errors_1.ForbiddenError('Access denied. Admin portal is restricted exclusively to Platform Superadmins.');
        }
        if (user.status === 'SUSPENDED') {
            throw new errors_1.ForbiddenError('Admin account is suspended. Please contact platform system administrator.');
        }
        const isMatch = await bcryptjs_1.default.compare(passwordText, user.passwordHash);
        if (!isMatch) {
            throw new errors_1.BadRequestError('Invalid admin credentials');
        }
        // Upsert AdminProfile to update lastLoginIp
        const adminProfile = await this.userRepo.upsertAdminProfile(user.id, {
            lastLoginIp: ipAddress || '127.0.0.1',
        });
        const permissions = (0, system_roles_1.getPermissionsForRole)(client_1.UserRole.SUPERADMIN);
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, permissions }, environment_1.env.JWT_SECRET, { expiresIn: '5d' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, environment_1.env.JWT_SECRET, { expiresIn: '7d' });
        const cacheKey = `auth:refresh_tokens:${user.id}:${refreshToken}`;
        await this.cacheService.set(cacheKey, '1', 7 * 24 * 60 * 60);
        return {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                adminProfile,
            },
            accessToken,
            refreshToken,
        };
    }
}
exports.AdminLoginCommandHandler = AdminLoginCommandHandler;
