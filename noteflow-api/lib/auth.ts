import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en el entorno');
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export function signJwt(payload: JwtPayload): string {
  return sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token: string): JwtPayload {
  return verify(token, JWT_SECRET) as JwtPayload;
}

export function getUserIdFromRequest(request: Request): string {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('No autorizado');
  }

  const token = authorization.split(' ')[1];
  if (!token) {
    throw new Error('No autorizado');
  }

  const decoded = verifyJwt(token);
  if (!decoded.userId) {
    throw new Error('No autorizado');
  }

  return decoded.userId;
}
