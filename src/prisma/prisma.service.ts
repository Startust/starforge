import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    if (process.env.DATABASE_URL) {
      await this.$connect().catch(() =>
        console.warn('⚠️ Prisma could not connect: DATABASE_URL not set'),
      );
    } else {
      console.warn('⚠️ DATABASE_URL not configured — Prisma running in dry mode');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async runTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    timeout = 15000,
    maxWait = 5000,
  ): Promise<T> {
    return this.$transaction(fn, { timeout, maxWait });
  }
}
