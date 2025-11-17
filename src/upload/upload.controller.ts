import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

import { CreatePresignDto } from './dto/create-presign.dto';
import { GetUploadMetaQueryDto } from './dto/get-upload-meta-query.dto';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presign')
  async createPresign(@Body() dto: CreatePresignDto) {
    return this.uploadService.generatePublicPresign(dto);
  }

  @SkipThrottle()
  @Get('meta')
  async getMeta(@Query() query: GetUploadMetaQueryDto) {
    return this.uploadService.getMetaByUrl(query.url, query.key);
  }
}
