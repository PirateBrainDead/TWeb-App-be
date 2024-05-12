import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { LoggedInUser } from './jwt-payload.dto';

export class LoginDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(8)
  password: string;
}

export class LoginResponse {
  token: string;
  user: LoggedInUser;
  lastLoggedInTime?: string;
}
