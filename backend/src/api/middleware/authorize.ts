import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from './auth';

/**
 * Policy Middleware: Require specified UserRole(s)
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

/**
 * Policy Middleware: Require granular permission string(s)
 */
export const requirePermission = (...requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required.' },
      });
    }

    // SUPERADMIN has elevated access across all policies
    if (req.user.role === UserRole.SUPERADMIN) {
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

/**
 * Resource Policy Middleware: Require resource ownership or SUPERADMIN role
 */
export const requireResourceOwner = (
  getOwnerId: (req: AuthenticatedRequest) => Promise<string | null | undefined> | string | null | undefined
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required.' },
      });
    }

    if (req.user.role === UserRole.SUPERADMIN) {
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
    } catch (error) {
      next(error);
    }
  };
};
