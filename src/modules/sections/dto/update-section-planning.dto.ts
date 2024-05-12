import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { dateNowFormatted, formatDate } from '../../../shared/utils/date.utils';

export class UpdateSectionPlanningDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID(4)
  sectionId: string;

  @ApiProperty({ required: true, default: dateNowFormatted() })
  @IsNotEmpty()
  @IsDateString()
  @Transform((date) => formatDate(date.value))
  date: string;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsBoolean()
  isDone: boolean;
}
