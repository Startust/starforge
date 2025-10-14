import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PaginatedResponseDto<T> {
  @Expose()
  @ApiProperty({ description: 'Data in current page', isArray: true })
  data: T[];

  @Expose()
  @ApiProperty({ description: 'Total items' })
  total: number;

  @Expose()
  @ApiProperty({ description: 'Current page number' })
  page: number;

  @Expose()
  @ApiProperty({ description: 'Item amount per page' })
  limit: number;

  @Expose()
  @ApiProperty({ description: 'Total page amount' })
  totalPages: number;
}
