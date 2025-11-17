import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsEnum, ValidateNested } from 'class-validator';

import { TransformJsonArrayUtil } from '../util/transform-json-array.util';

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

  @ApiPropertyOptional({
    description: 'Sort by multiple fields, e.g., [{ field: "createdAt", order: "desc" }]',
    type: 'array',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SortFieldDto)
  @TransformJsonArrayUtil(SortFieldDto)
  sortBy?: SortFieldDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => (value === '' ? undefined : value))
  keyword?: string;
}
