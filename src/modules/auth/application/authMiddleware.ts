import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '../../user/domain/valueObjects/user-role.vo';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string; role: number };
}

export const AuthMiddleware = (allowedRole: number) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required.' });
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not set');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        id: number;
        email: string;
        role: number;
      };

      if (decoded.role === allowedRole) {
        req.user = decoded;
        return next();
      }
      else if(decoded.role === UserRole.ADMIN) {
        req.user = decoded;
        return next()
      }  
       else {
        return res.status(403).json({ message: 'Unauthorized role' });
      }
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};
