import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | null = null;

  // 1. Try to extract from Authorization Header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Try to extract from Cookie Header
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';');
    for (const cookie of cookies) {
      const parts = cookie.trim().split('=');
      if (parts[0] === 'token') {
        token = decodeURIComponent(parts.slice(1).join('='));
        break;
      }
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Please log in.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    // Clear invalid cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  req.userId = decoded.userId;
  next();
}
