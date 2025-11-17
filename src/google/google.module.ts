import { Module } from '@nestjs/common';

import { GmailService } from './gmail.service';
import { GoogleAuthService } from './google-auth.service';
import { GoogleSheetsService } from './google-sheets.service';

@Module({
  providers: [GoogleAuthService, GmailService, GoogleSheetsService],
  exports: [GmailService, GoogleSheetsService],
})
export class GoogleModule {}
