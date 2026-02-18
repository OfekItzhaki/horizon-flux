import { IsEnum, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShareRole } from '@prisma/client';

export class ShareTaskDto {
  @ApiProperty({
    description: 'Email of the user to share the task with',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Role of the shared user',
    enum: ShareRole,
    default: ShareRole.EDITOR,
  })
  @IsEnum(ShareRole)
  @IsOptional()
  role?: ShareRole;
}
