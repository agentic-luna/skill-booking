"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../config/environment");
const prisma_1 = require("../config/prisma");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: { message: 'Authentication required. Bearer token missing.' },
            });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.env.JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user || user.status === 'SUSPENDED' || user.deletedAt) {
            return res.status(401).json({
                success: false,
                error: { message: 'Invalid, suspended, or deleted user account.' },
            });
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: { message: 'Invalid or expired authentication token.' },
        });
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { message: 'Authentication required.' },
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: { message: 'Access denied. Insufficient permissions.' },
            });
        }
        next();
    };
};
exports.authorize = authorize;
