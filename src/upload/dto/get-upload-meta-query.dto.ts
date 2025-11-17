import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetUploadMetaQueryDto {
  @ApiPropertyOptional({ description: 'Get upload metadata from the server' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'Specify the key for the upload' })
  @IsOptional()
  @IsString()
  key?: string;
}
