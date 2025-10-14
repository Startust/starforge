import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as process from 'node:process';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationModule } from './notification/notification.module';
import { NotificationService } from './notification/notification.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { QueueModule } from './queue/queue.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // Time to live for the rate limit in milliseconds
          limit: 60, // Maximum number of requests allowed
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}.local`, // Use NODE_ENV to determine the env file
        `.env.${process.env.NODE_ENV || 'development'}`, // Fallback to the default env file
        '.env',
      ],
    }),
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    PrismaModule,
    NotificationModule,
    QueueModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    NotificationService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
