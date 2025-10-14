import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { NotificationService } from '../notification/notification.service';

export interface EmailJob {
  to: string;
  data: any;
}

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  async process(job: Job<EmailJob>) {
    switch (job.name) {
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }

    throw new Error('Unknown job name: ' + job.name);
  }
}
