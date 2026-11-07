import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PUBLIC_USER_SELECT } from '../user/user.constants.js';
import { UserService } from '../user/user.service.js';
import type {
  AuthenticatedRequest,
  AuthenticatedUser,
  JwtPayload,
} from './auth.types.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    const payload = await this.verifyToken(token);
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId)) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    // The token only identifies the user; everything else comes from the
    // database, so deleted users lose access before the token expires.
    const user: AuthenticatedUser | null = await this.userService.user({
      where: { id: userId },
      select: PUBLIC_USER_SELECT,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    request.user = user;
    return true;
  }

  private async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
