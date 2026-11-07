import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { AuthService } from './auth.service.js';
import type { AuthenticatedUser } from './auth.types.js';
import { CurrentUser } from './current-user.decorator.js';
import { Public } from './public.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() body: Prisma.UserCreateInput) {
    return this.authService.signin(body);
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
