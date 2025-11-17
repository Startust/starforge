import { Module } from '@nestjs/common';

import { TaskAdminController } from './task-admin.controller';
import { TaskAdminService } from './task-admin.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [TaskAdminService],
  controllers: [TaskAdminController],
})
export class TaskModule {}
