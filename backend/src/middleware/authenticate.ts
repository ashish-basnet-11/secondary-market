import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: number;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: no token provided' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    res.locals.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: invalid or expired token' });
  }
}
