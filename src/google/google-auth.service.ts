import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Auth, google } from 'googleapis';

@Injectable()
export class GoogleAuthService {
  private readonly oauth2Client: Auth.OAuth2Client;

  constructor(private readonly config: ConfigService) {
    const CLIENT_ID = this.config.get<string>('GOOGLE_CLIENT_ID');
    const CLIENT_SECRET = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    const REDIRECT_URI = this.config.get<string>('GOOGLE_REDIRECT_URI');
    const REFRESH_TOKEN = this.config.get<string>('GOOGLE_REFRESH_TOKEN');

    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !REFRESH_TOKEN) {
      console.warn('Google OAuth2 configuration is not fully defined');
    }
    this.oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    this.oauth2Client.setCredentials({
      refresh_token: REFRESH_TOKEN,
    });
  }

  getClient() {
    return this.oauth2Client;
  }
}
