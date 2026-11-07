import type { Request } from 'express';

/** Claims written into the access token by `AuthService.signin()`. */
export interface JwtPayload {
  sub: string;
}

/** User loaded from the database after the token is verified. */
export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
