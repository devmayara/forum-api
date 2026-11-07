import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../auth/public.decorator.js';
import { User } from '../generated/prisma/client.js';
import { PUBLIC_USER_SELECT } from './user.constants.js';
import { UserService } from './user.service.js';

type PublicUser = Omit<User, 'password'>;

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get()
  async findAll(@Query('search') search?: string): Promise<PublicUser[]> {
    return this.usersService.users({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { id: 'asc' },
      select: PUBLIC_USER_SELECT,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PublicUser> {
    const user = await this.usersService.user({
      where: { id },
      select: PUBLIC_USER_SELECT,
    });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  @Public()
  @Post()
  async create(
    @Body() userData: { name?: string; email: string; password: string },
  ): Promise<PublicUser> {
    return this.usersService.createUser({
      data: userData,
      select: PUBLIC_USER_SELECT,
    });
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() userData: { name?: string; email?: string; password?: string },
  ): Promise<PublicUser> {
    return this.usersService.updateUser({
      where: { id },
      data: userData,
      select: PUBLIC_USER_SELECT,
    });
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<PublicUser> {
    return this.usersService.deleteUser({
      where: { id },
      select: PUBLIC_USER_SELECT,
    });
  }
}
