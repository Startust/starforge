import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';

import { EmailProcessor } from './email.processor';
import { NotificationModule } from '../notification/notification.module';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullModule.registerQueue({
      name: 'email-queue',
    }),
    BullBoardModule.forFeature({
      name: 'email-queue',
      adapter: BullMQAdapter,
    }),
    NotificationModule,
  ],
  providers: [EmailProcessor],
  exports: [BullModule],
})
export class QueueModule {}
