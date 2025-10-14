import { Module } from '@nestjs/common';

import { GmailService } from './gmail.service';
import { NotificationService } from './notification.service';

@Module({
  providers: [NotificationService, GmailService],
  exports: [NotificationService, GmailService],
})
export class NotificationModule {}
