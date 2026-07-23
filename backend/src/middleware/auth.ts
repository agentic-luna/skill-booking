import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { prisma } from '../config/prisma';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string | null;
    role: 'SUPERADMIN' | 'HOST' | 'CLIENT';
    status: 'ACTIVE' | 'SUSPENDED';
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
      role: 'SUPERADMIN' | 'HOST' | 'CLIENT';
    };

    const user = await prisma.user.findUnique({
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
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired authentication token.' },
    });
  }
};

export const authorize = (roles: Array<'SUPERADMIN' | 'HOST' | 'CLIENT'>) => {
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
