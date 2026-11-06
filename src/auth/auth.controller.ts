import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() body: Prisma.UserCreateInput) {
    return this.authService.signin(body);
  }
}
