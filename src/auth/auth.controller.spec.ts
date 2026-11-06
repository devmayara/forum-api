import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = { signin: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('returns the access token from the auth service', async () => {
    authService.signin.mockResolvedValue({ access_token: 'signed.jwt.token' });

    await expect(
      controller.signin({ email: 'user@example.com', password: 'password' }),
    ).resolves.toEqual({ access_token: 'signed.jwt.token' });
  });
});
