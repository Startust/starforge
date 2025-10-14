import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { gmail_v1, google } from 'googleapis';

import Gmail = gmail_v1.Gmail;

@Injectable()
export class GmailService {
  private gmail: Gmail;
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const CLIENT_ID = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const CLIENT_SECRET = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const REDIRECT_URI = this.configService.get<string>('GOOGLE_REDIRECT_URI');
    const REFRESH_TOKEN = this.configService.get<string>('GOOGLE_REFRESH_TOKEN');
    const fromEmail = this.configService.get<string>('GMAIL_FROM_EMAIL');

    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !REFRESH_TOKEN || !fromEmail) {
      console.warn('Google OAuth2 configuration is not fully defined');
    }

    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    oauth2Client.setCredentials({
      refresh_token: REFRESH_TOKEN,
    });

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
