import { S3Client } from '@aws-sdk/client-s3';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const S3_CLIENT = Symbol('S3_CLIENT');

@Module({})
export class AwsModule {
  static forRoot(): DynamicModule {
    return {
      module: AwsModule,
      providers: [
        {
          provide: S3_CLIENT,
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            const region = config.get<string>('AWS_REGION');
            const accessKeyId = config.get<string>('AWS_ACCESS_KEY_ID');
            const secretAccessKey = config.get<string>('AWS_SECRET_ACCESS_KEY');

            if (!region || !accessKeyId || !secretAccessKey) {
              throw new Error('AWS credentials are not set in the environment variables');
            }

            return new S3Client({
              region,
              credentials: { accessKeyId, secretAccessKey },
            });
          },
        },
      ],
      exports: [S3_CLIENT],
    };
  }
}
