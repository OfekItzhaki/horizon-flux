import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStepDto {
  @ApiPropertyOptional({
    description: 'Step description',
    example: 'Updated step description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the step is completed',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
