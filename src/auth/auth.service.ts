import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma, User } from '../generated/prisma/client.js';
import { UserService } from '../user/user.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async signin(params: Prisma.UserCreateInput): Promise<Omit<User, 'password'>> {
    const user = await this.userService.user({
      where: { email: params.email },
      select: { id: true, email: true, password: true },
    });
    if (!user) throw new NotFoundException('User not found');
    
    const passwordMatch = await bcrypt.compare(params.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const { password, ...result } = user;
    return result;
  }
}
