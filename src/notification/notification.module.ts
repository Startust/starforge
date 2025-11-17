import { Global, Module } from '@nestjs/common';

import { NotificationService } from './notification.service';
import { GoogleModule } from '../google/google.module';

@Global()
@Module({
  imports: [GoogleModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
