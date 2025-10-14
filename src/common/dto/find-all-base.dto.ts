import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsEnum, ValidateNested } from 'class-validator';

import { TransformJsonArray } from '../../utils/transform-json-array';

export class SortFieldDto {
  @IsString()
  field: string;

  @IsEnum(['asc', 'desc'])
  order: 'asc' | 'desc';
}

export class FindAllBaseDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number) // Ensure the value is transformed to a number
  @Transform(({ value }: { value: string }) => (value === '' ? undefined : value))
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number) // Ensure the value is transformed to a number
  @Transform(({ value }: { value: string }) => (value === '' ? undefined : value))
  limit?: number = 20;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => (value === '' ? undefined : value))
  sort?: string = 'createdAt'; // Default sorting field, can be overridden by the caller

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => (value === '' ? undefined : value))
  order?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Sort by multiple fields, e.g., [{ field: "createdAt", order: "desc" }]',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        field: { type: 'string' },
        order: { type: 'string', enum: ['asc', 'desc'] },
      },
    },
    example: [{ field: 'createdAt', order: 'desc' }],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SortFieldDto)
  @TransformJsonArray(SortFieldDto)
  sortBy?: SortFieldDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => (value === '' ? undefined : value))
  keyword?: string;
}
