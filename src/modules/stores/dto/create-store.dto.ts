import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { Match } from '../../../shared/decorators/validators/match.decorator';

export class CreateStoreDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  storeName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(3)
  @MaxLength(20)
  managerUsername: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(8)
  @Match(CreateStoreDto, (c) => c.managerConfirmPassword)
  managerPassword: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(8)
  managerConfirmPassword: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(3)
  @MaxLength(20)
  hqUsername: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(8)
  @Match(CreateStoreDto, (c) => c.hqConfirmPassword)
  hqPassword: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(8)
  hqConfirmPassword: string;
}
