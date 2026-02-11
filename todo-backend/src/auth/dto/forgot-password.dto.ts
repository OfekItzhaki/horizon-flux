<<<<<<< HEAD
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
=======
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
<<<<<<< HEAD
=======

  @ApiProperty({
    description: 'Cloudflare Turnstile token',
    required: false,
  })
  @IsString()
  @IsOptional()
  captchaToken?: string;
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
}

export class VerifyResetOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'jwt-token-here' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'new-secure-password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'new-secure-password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  passwordConfirm: string;
}
