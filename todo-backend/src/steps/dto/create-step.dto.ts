import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStepDto {
  @ApiProperty({
    description: 'Step description',
    example: 'Review code changes',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Whether the step is completed',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
