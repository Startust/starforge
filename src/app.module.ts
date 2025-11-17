import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as process from 'node:process';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AwsModule } from './aws/aws.module';
import { GoogleModule } from './google/google.module';
import { NotificationModule } from './notification/notification.module';
import { NotificationService } from './notification/notification.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { QueueModule } from './queue/queue.module';
import { TaskModule } from './task/task.module';
import { UploadModule } from './upload/upload.module';
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
    PrismaModule,
    NotificationModule,
    QueueModule,
    WebhookModule,
    GoogleModule,
    AwsModule,
    UploadModule,
    TaskModule,
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
