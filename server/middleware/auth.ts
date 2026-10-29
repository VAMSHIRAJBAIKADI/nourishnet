import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthJWTPayload, UserRole } from '../types';

export const JWT_SECRET = process.env.JWT_SECRET || 'nourishnet-enterprise-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: AuthJWTPayload;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ error: 'Authentication required. No Bearer token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthJWTPayload;
    // Normalize payload id/userId
    if (!decoded.userId && decoded.id) {
      decoded.userId = decoded.id;
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired session token. Please re-authenticate.' });
    return;
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User authentication required.' });
      return;
    }

    // Treat RECIPIENT and RECIPIENT_NGO as equivalent roles
    const userRole = req.user.role;
    const isAllowed = allowedRoles.some((role) => {
      if (role === 'RECIPIENT' || role === 'RECIPIENT_NGO') {
        return userRole === 'RECIPIENT' || userRole === 'RECIPIENT_NGO';
      }
      return role === userRole;
    });

    if (!isAllowed) {
      res.status(403).json({
        error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles. Your current role is ${userRole}.`
      });
      return;
    }

    next();
  };
}

export const requireDonor = requireRole(['DONOR']);
export const requireRecipient = requireRole(['RECIPIENT', 'RECIPIENT_NGO']);
export const requireAdmin = requireRole(['ADMIN']);
