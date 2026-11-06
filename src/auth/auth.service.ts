import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '../generated/prisma/client.js';
import { UserService } from '../user/user.service.js';
import * as bcrypt from 'bcrypt';

export interface SignInResponse {
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signin(params: Prisma.UserCreateInput): Promise<SignInResponse> {
    const user = await this.userService.user({
      where: { email: params.email },
      select: { id: true, email: true, password: true },
    });

    // Same error for unknown e-mail and wrong password, so the response
    // cannot be used to discover which e-mails are registered.
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(params.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.jwtService.signAsync({
      sub: String(user.id),
    });

    return { access_token: accessToken };
  }
}
