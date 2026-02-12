import { IsString, IsEnum, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShareRole } from '@prisma/client';

export class ShareListDto {
  @ApiProperty({
    description: 'Email of the user to share the list with',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'ID of the user (internal use)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsOptional()
  sharedWithId?: string;

  @ApiPropertyOptional({
    description: 'Role of the shared user',
    enum: ShareRole,
    default: ShareRole.EDITOR,
  })
  @IsEnum(ShareRole)
  @IsOptional()
  role?: ShareRole;
}
