import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ShareListDto {
  @ApiProperty({
    description: 'User ID to share the list with',
    example: 2,
  })
  @IsInt()
  sharedWithId: number;
}
