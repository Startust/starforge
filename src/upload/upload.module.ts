import { Module } from '@nestjs/common';

import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [AwsModule.forRoot()],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
