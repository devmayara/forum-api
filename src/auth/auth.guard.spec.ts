import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service.js';
import { JwtAuthGuard } from './auth.guard.js';
import type { AuthenticatedUser } from './auth.types.js';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  const jwtService = { verifyAsync: vi.fn() };
  const reflector = { getAllAndOverride: vi.fn() };
  const userService = { user: vi.fn() };

  const authenticatedUser: AuthenticatedUser = {
    id: 1,
    email: 'user@example.com',
    name: 'User',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const createContext = (authorization?: string) => {
    const request: {
      headers: { authorization?: string };
      user?: AuthenticatedUser;
    } = { headers: { authorization } };
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    return { context, request };
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    reflector.getAllAndOverride.mockReturnValue(false);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: JwtService, useValue: jwtService },
        { provide: Reflector, useValue: reflector },
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('allows routes marked as public without a token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const { context } = createContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    expect(userService.user).not.toHaveBeenCalled();
  });

  it('rejects a request without a bearer token', async () => {
    const { context } = createContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects an invalid token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));
    const { context } = createContext('Bearer bad.token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a token whose user no longer exists', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: '1' });
    userService.user.mockResolvedValue(null);
    const { context } = createContext('Bearer valid.token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('attaches the current user to the request', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: '1' });
    userService.user.mockResolvedValue(authenticatedUser);
    const { context, request } = createContext('Bearer valid.token');

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(request.user).toEqual(authenticatedUser);
    expect(userService.user).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } }),
    );
  });
});
