import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  const userService = { user: vi.fn() };
  const jwtService = { signAsync: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('returns only an access token when the credentials are valid', async () => {
    const password = 'correct-password';
    userService.user.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      password: await bcrypt.hash(password, 4),
    });
    jwtService.signAsync.mockResolvedValue('signed.jwt.token');

    const result = await service.signin({
      email: 'user@example.com',
      password,
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: '1',
      email: 'user@example.com',
    });
    expect(result).toEqual({ access_token: 'signed.jwt.token' });
  });

  it('rejects an unknown e-mail', async () => {
    userService.user.mockResolvedValue(null);

    await expect(
      service.signin({ email: 'missing@example.com', password: 'whatever' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects a wrong password', async () => {
    userService.user.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      password: await bcrypt.hash('correct-password', 4),
    });

    await expect(
      service.signin({ email: 'user@example.com', password: 'wrong-password' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
