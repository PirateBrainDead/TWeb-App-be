import { ApiProperty } from '@nestjs/swagger';
import { dateNowFormatted, formatDate } from '../../../shared/utils/date.utils';
import { IsDateString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryDateDto {
  @ApiProperty({ required: true, example: dateNowFormatted() })
  @IsNotEmpty()
  @IsDateString()
  @Transform((date) => formatDate(date.value))
  date: string;
}
