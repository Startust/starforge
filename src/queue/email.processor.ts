import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { JOB } from './queue.constant';
import { NotificationService } from '../notification/notification.service';

export interface EmailJob {
  to: string;
  data: any;
}

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly notification: NotificationService) {
    super();
  }

  async process(job: Job<EmailJob>) {
    switch (job.name) {
      case JOB.EMAIL_SAMPLE:
        this.logger.log(`Processing job: ${job.name} for ${job.data.to}`);
        return this.handleEmailSample(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }

    throw new Error('Unknown job name: ' + job.name);
  }

  async handleEmailSample(data: EmailJob) {
    return this.notification.sendEmailSample(data.to);
  }
}
