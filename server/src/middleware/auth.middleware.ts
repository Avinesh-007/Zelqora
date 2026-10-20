import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { User } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
  guestToken?: string;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Check HttpOnly cookie or Authorization Bearer header
    let token = req.cookies?.zelqora_session;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.slice(7).trim();
    }

    if (token) {
      const user = await AuthService.validateSession(token);
      if (user) {
        req.user = user;
      }
    }

    // 2. Check guest token header for anonymous sessions
    const guestHeader = req.headers['x-zelqora-guest-token'];
    if (typeof guestHeader === 'string' && guestHeader.trim().length > 0) {
      req.guestToken = guestHeader.trim();
    }

    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication Required',
      message: 'You must be signed in to access this resource.'
    });
    return;
  }
  next();
}

export function requireRole(allowedRoles: ('user' | 'editor' | 'admin')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication Required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Your account does not have sufficient permissions to perform this action.'
      });
      return;
    }

    next();
  };
}
