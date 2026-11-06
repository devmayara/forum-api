import { Module } from '@nestjs/common';
import { DATABASE_URL } from './prisma.constants.js';
import { PrismaService } from './prisma.service.js';

@Module({
  providers: [
    {
      provide: DATABASE_URL,
      useFactory: () => {
        const url = process.env.DATABASE_URL || '';
        if (!url) {
          throw new Error('DATABASE_URL is not set');
        }
        return url;
      },
    },
    PrismaService,
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
