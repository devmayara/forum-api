import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module.js';
import { JwtAuthGuard } from './auth.guard.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET || '';
        if (!secret) {
          throw new Error('JWT_SECRET is not set');
        }

        return {
          secret,
          signOptions: {
            expiresIn: Number(process.env.JWT_EXPIRES_IN ?? 86_400),
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Global guard: every route requires a valid bearer token unless it is
    // marked with @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
