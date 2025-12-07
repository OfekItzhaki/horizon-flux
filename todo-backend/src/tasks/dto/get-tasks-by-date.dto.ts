import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetTasksByDateDto {
  @ApiPropertyOptional({
    description: 'Date to filter tasks (defaults to today)',
    example: '2024-12-25',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;
}
