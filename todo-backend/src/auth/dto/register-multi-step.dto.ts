<<<<<<< HEAD
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
=======
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
} from 'class-validator';
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
import { ApiProperty } from '@nestjs/swagger';

export class RegisterStartDto {
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

export class RegisterVerifyDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otp: string;
}

export class RegisterFinishDto {
  @ApiProperty({ description: 'The token received from the verify step' })
  @IsString()
  @IsNotEmpty()
  registrationToken: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @Length(6, 50)
  password: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @Length(6, 50)
  passwordConfirm: string;
}
