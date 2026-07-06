"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireResourceOwner = exports.requirePermission = exports.requireRole = void 0;
const client_1 = require("@prisma/client");
/**
 * Policy Middleware: Require specified UserRole(s)
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { message: 'Authentication required.' },
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: {
                    message: `Forbidden. Role '${req.user.role}' is not authorized for this policy.`,
                    code: 'Forbidden',
                },
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Policy Middleware: Require granular permission string(s)
 */
const requirePermission = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { message: 'Authentication required.' },
            });
        }
        // SUPERADMIN has elevated access across all policies
        if (req.user.role === client_1.UserRole.SUPERADMIN) {
            return next();
        }
        const userPermissions = req.user.permissions || [];
        const hasAllPermissions = requiredPermissions.every((perm) => userPermissions.includes(perm));
        if (!hasAllPermissions) {
            return res.status(403).json({
                success: false,
                error: {
                    message: `Access denied. Missing required policy permission(s): ${requiredPermissions.join(', ')}`,
                    code: 'Forbidden',
                },
            });
        }
        next();
    };
};
exports.requirePermission = requirePermission;
/**
 * Resource Policy Middleware: Require resource ownership or SUPERADMIN role
 */
const requireResourceOwner = (getOwnerId) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { message: 'Authentication required.' },
            });
        }
        if (req.user.role === client_1.UserRole.SUPERADMIN) {
            return next();
        }
        try {
            const resourceOwnerId = await getOwnerId(req);
            if (!resourceOwnerId || resourceOwnerId !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'Access denied. You can only view or manage your own resources.',
                        code: 'Forbidden',
                    },
                });
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireResourceOwner = requireResourceOwner;
