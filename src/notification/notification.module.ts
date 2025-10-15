import { Global, Module } from '@nestjs/common';

import { GmailService } from './gmail.service';
import { NotificationService } from './notification.service';

@Global()
@Module({
  providers: [NotificationService, GmailService],
  exports: [NotificationService, GmailService],
})
export class NotificationModule {}
