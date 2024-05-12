import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { Match } from '../../../shared/decorators/validators/match.decorator';

export class ChangePasswordDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(8)
  oldPassword: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(8)
  @Match(ChangePasswordDto, (c) => c.newRepeatPassword)
  newPassword: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(8)
  newRepeatPassword: string;
}
