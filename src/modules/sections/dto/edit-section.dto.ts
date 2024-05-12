import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class EditSectionDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID(4)
  sectionId: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(25)
  name: string;
}
