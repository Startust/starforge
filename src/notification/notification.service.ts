import { Injectable, Logger } from '@nestjs/common';

import { GmailService } from '../google/gmail.service';
import { renderTemplate } from './utils/email-render.util';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(private readonly gmail: GmailService) {}

  async sendEmailSample(to: string) {
    const html = await renderTemplate('sample-email', {});
    await this.gmail.sendGmailEmail(to, 'Sample Email Subject', html);
    this.logger.log('Email sent to ' + to);
  }
}
