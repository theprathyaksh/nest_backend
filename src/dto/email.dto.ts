import { IsEmail, IsOptional, IsString } from '@nestjs/class-validator';

export class sendEmailDto {
  @IsEmail({}, { each: true })
  recipients: string;

  @IsString()
  subject: string;

  @IsString()
  html: string;

  @IsOptional()
  @IsString()
  text?: string;
}
