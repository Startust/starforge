import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { gmail_v1, google } from 'googleapis';

import { GoogleAuthService } from './google-auth.service';

import Gmail = gmail_v1.Gmail;

@Injectable()
export class GmailService {
  private gmail: Gmail;
  private readonly fromEmail: string;

  constructor(
    private config: ConfigService,
    private readonly googleAuth: GoogleAuthService,
  ) {
    const fromEmail = this.config.get<string>('GMAIL_FROM_EMAIL');

    if (!fromEmail) {
      console.warn('GMAIL_FROM_EMAIL is not defined');
    }

    const oauth2Client = this.googleAuth.getClient();
    this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    this.fromEmail = fromEmail || '';
  }

  async sendGmailEmail(to: string, subject: string, html: string) {
    const messageParts = [
      `From: "Starforge" <${this.fromEmail}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      html,
    ];
    const message = messageParts.join('\n');
    const raw = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw,
      },
    });
    return res.data;
  }
}
