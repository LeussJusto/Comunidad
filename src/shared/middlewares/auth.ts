import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@config/index';
import { UnauthorizedError } from '../errors';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; role: string };
    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    next(new UnauthorizedError('Token inválido o expirado'));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return next(new UnauthorizedError('No tienes permisos para realizar esta acción'));
    }
    next();
  };
};
