import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, sheets_v4 } from 'googleapis';

import { GoogleAuthService } from './google-auth.service';

@Injectable()
export class GoogleSheetsService {
  private readonly sheets: sheets_v4.Sheets;

  constructor(
    private readonly config: ConfigService,
    private readonly googleAuth: GoogleAuthService,
  ) {
    const auth = this.googleAuth.getClient();
    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async getSheetValues(spreadsheetId: string, range: string | string[]) {
    if (Array.isArray(range)) {
      const res = await this.sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges: range,
      });
      return res.data.valueRanges;
    } else {
      const res = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      return res.data.values;
    }
  }
}
