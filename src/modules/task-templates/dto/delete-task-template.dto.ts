import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteTaskTemplateDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID(4)
  id: string;
}
