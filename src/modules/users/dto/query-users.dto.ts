import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';
import dayjs from 'dayjs';
import { DATETIME_FORMAT } from '../../../shared/constants/date.constants';
import { Transform } from 'class-transformer';
import { dateNowFormatted } from '../../../shared/utils/date.utils';

export class DateQuery {
  @ApiProperty({ required: true, example: dateNowFormatted(DATETIME_FORMAT) })
  @IsNotEmpty()
  @IsDateString()
  @Transform((date) => dayjs(date.value).format(DATETIME_FORMAT))
  date: string;
}
