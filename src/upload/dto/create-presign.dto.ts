import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class CreatePresignDto {
  // 文件的 MIME 类型
  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/png',
  })
  @IsString()
  contentType: string;

  // 文件名（含扩展名）
  @ApiPropertyOptional({
    description: 'The file name with extension',
    example: 'example.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  // 64 位 hex：前端基于文件字节算出的 SHA-256（推荐传）
  @ApiPropertyOptional({
    description: 'SHA-256 hash of the file in 64-char hex string',
    example: '3a7bd3e2360a3d4855f3c4d2f8b5f9c1e6d7f8e9a0b1c2d3e4f5a6b7c8d9e0f1',
    required: false,
  })
  @IsOptional()
  @Matches(/^[a-f0-9]{64}$/i, { message: 'sha256Hex must be a 64-char hex string' })
  sha256Hex?: string;
}
