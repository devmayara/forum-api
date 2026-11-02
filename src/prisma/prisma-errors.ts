import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';

export function translatePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target = (error.meta?.target as string[] | undefined)?.join(', ');
        throw new ConflictException(
          target
            ? `Unique constraint failed on field(s): ${target}`
            : 'Unique constraint failed',
        );
      }
      case 'P2025':
        throw new NotFoundException(error.message);
      case 'P2003':
        throw new BadRequestException('Related record not found');
      default:
        throw new BadRequestException(error.message);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException(error.message);
  }

  throw error;
}

export async function withPrismaErrors<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    translatePrismaError(error);
  }
}
