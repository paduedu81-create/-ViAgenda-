import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) {
      throw new AppError(401, 'Token não informado');
    }

    req.user = jwt.verify(h.slice(7), env.JWT_SECRET) as AuthUser;
    next();
  } catch (e) {
    next(
      e instanceof AppError
        ? e
        : new AppError(401, 'Token inválido ou expirado')
    );
  }
}

export function authorize(...profiles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.user && profiles.includes(req.user.perfil)) {
      return next();
    }
    return next(new AppError(403, 'Acesso não permitido'));
  };
}
