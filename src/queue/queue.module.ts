import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { EmailProcessor } from './email.processor';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
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
