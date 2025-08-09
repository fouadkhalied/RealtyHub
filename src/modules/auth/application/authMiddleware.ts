import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '../../user/domain/valueObjects/user-role.vo';
import { ErrorBuilder } from '../../../libs/common/errors/errorBuilder';
import { ErrorCode } from '../../../libs/common/errors/enums/basic.error.enum';
import { ERROR_STATUS_MAP } from '../../../libs/common/errors/mapper/mapperErrorEnum';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string; role: number };
}

export const AuthMiddleware = (allowedRole: number) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      const errorResponse = ErrorBuilder.build(
        ErrorCode.UNAUTHORIZED, 
        'Authentication token is required.'
      );
      return res.status(ERROR_STATUS_MAP[ErrorCode.UNAUTHORIZED]).json(errorResponse);
    }

    try {
      if (!process.env.JWT_SECRET) {
        const errorResponse = ErrorBuilder.build(
          ErrorCode.INTERNAL_SERVER_ERROR, 
          'JWT configuration error'
        );
        return res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(errorResponse);
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
      else if (decoded.role === UserRole.ADMIN) {
        req.user = decoded;
        return next();
      }  
      else {
        const errorResponse = ErrorBuilder.build(
          ErrorCode.FORBIDDEN, 
          'Unauthorized role'
        );
        return res.status(ERROR_STATUS_MAP[ErrorCode.FORBIDDEN]).json(errorResponse);
      }
    } catch (err) {
      const errorResponse = ErrorBuilder.build(
        ErrorCode.UNAUTHORIZED, 
        'Invalid or expired token'
      );
      return res.status(ERROR_STATUS_MAP[ErrorCode.UNAUTHORIZED]).json(errorResponse);
    }
  };
};