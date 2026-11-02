import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { withPrismaErrors } from '../prisma/prisma-errors.js';

const SALT_ROUNDS = 12;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async user(params: {
    where: Prisma.UserWhereUniqueInput;
    select?: Prisma.UserSelect;
  }) {
    const { where, select } = params;
    return withPrismaErrors(() =>
      this.prisma.user.findUnique({ where, select }),
    );
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    select?: Prisma.UserSelect;
  }) {
    const { skip, take, cursor, where, orderBy, select } = params;
    return withPrismaErrors(() =>
      this.prisma.user.findMany({ skip, take, cursor, where, orderBy, select }),
    );
  }

  async createUser(params: {
    data: Prisma.UserCreateInput;
    select?: Prisma.UserSelect;
  }) {
    const { data, select } = params;
    if (!data.email || !data.password) {
      throw new BadRequestException('email and password are required');
    }
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    return withPrismaErrors(() =>
      this.prisma.user.create({
        data: { ...data, password: hashedPassword },
        select,
      }),
    );
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
    select?: Prisma.UserSelect;
  }) {
    const { where, data, select } = params;
    const updateData = data.password
      ? {
          ...data,
          password: await bcrypt.hash(String(data.password), SALT_ROUNDS),
        }
      : data;
    return withPrismaErrors(() =>
      this.prisma.user.update({ data: updateData, where, select }),
    );
  }

  async deleteUser(params: {
    where: Prisma.UserWhereUniqueInput;
    select?: Prisma.UserSelect;
  }) {
    const { where, select } = params;
    return withPrismaErrors(() =>
      this.prisma.user.delete({ where, select }),
    );
  }
}
