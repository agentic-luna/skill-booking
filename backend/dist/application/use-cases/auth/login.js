"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginCommandHandler = exports.LoginCommand = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../../../config/environment");
const system_roles_1 = require("../../../security/system.roles");
const errors_1 = require("../../common/errors");
class LoginCommand {
    identifier;
    passwordText;
    __tag = 'LoginCommand';
    constructor(identifier, passwordText) {
        this.identifier = identifier;
        this.passwordText = passwordText;
    }
}
exports.LoginCommand = LoginCommand;
class LoginCommandHandler {
    userRepo;
    cacheService;
    constructor(userRepo, cacheService) {
        this.userRepo = userRepo;
        this.cacheService = cacheService;
    }
    async handle(command) {
        const { identifier, passwordText } = command;
        if (!identifier || !passwordText) {
            throw new errors_1.BadRequestError('Email or mobile number and password are required');
        }
        let user = await this.userRepo.findByEmail(identifier.toLowerCase().trim());
        if (!user) {
            // Try case-sensitive email as fallback
            user = await this.userRepo.findByEmail(identifier.trim());
        }
        if (!user) {
            // Try exact phone match
            user = await this.userRepo.findByPhone(identifier.trim());
        }
        if (!user && !identifier.startsWith('+')) {
            // Try with leading + (e.g. user types "919947811507" but stored as "+919947811507")
            user = await this.userRepo.findByPhone('+' + identifier.trim());
        }
        if (!user && identifier.startsWith('+')) {
            // Try without leading + as fallback
            user = await this.userRepo.findByPhone(identifier.trim().slice(1));
        }
        if (!user || user.deletedAt) {
            throw new errors_1.BadRequestError('Invalid email/mobile number or password');
        }
        if (user.role === 'SUPERADMIN') {
            throw new errors_1.ForbiddenError('Platform Superadmins must authenticate via the dedicated admin login portal (/api/v1/admin/login).');
        }
        if (user.status === 'SUSPENDED') {
            throw new errors_1.ForbiddenError('Your account is suspended. Please contact support.');
        }
        const isMatch = await bcryptjs_1.default.compare(passwordText, user.passwordHash);
        if (!isMatch) {
            throw new errors_1.BadRequestError('Invalid email or password');
        }
        const permissions = (0, system_roles_1.getPermissionsForRole)(user.role);
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
            },
            accessToken,
            refreshToken,
        };
    }
}
exports.LoginCommandHandler = LoginCommandHandler;
