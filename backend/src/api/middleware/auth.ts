import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, UserStatus } from '@prisma/client';
import { env } from '../../config/environment';
import { prisma } from '../../config/prisma';
import { getPermissionsForRole } from '../../security/system.roles';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string | null;
    role: UserRole;
    status: UserStatus;
    permissions: string[];
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required. Bearer token missing.' },
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
      permissions?: string[];
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.status === UserStatus.SUSPENDED || user.deletedAt) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid, suspended, or deleted user account.' },
      });
    }

    const permissions = decoded.permissions && decoded.permissions.length > 0
      ? decoded.permissions
      : getPermissionsForRole(user.role);

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      permissions,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired authentication token.' },
    });
  }
};

export const authorize = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
