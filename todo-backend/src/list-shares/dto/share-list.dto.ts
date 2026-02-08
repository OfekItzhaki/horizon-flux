import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShareRole } from '@prisma/client';

export class ShareListDto {
  @ApiProperty({
    description: 'User ID to share the list with',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  sharedWithId: string;

  @ApiProperty({
    description: 'Role of the shared user',
    enum: ShareRole,
    default: ShareRole.EDITOR,
    required: false,
  })
  @IsEnum(ShareRole)
  @IsOptional()
  role?: ShareRole;
}
