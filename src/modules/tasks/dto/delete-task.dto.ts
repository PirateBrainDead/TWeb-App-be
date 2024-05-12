import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MinCustomDate } from '../../../shared/decorators/validators/min-date.decorator';
import { dateNowFormatted, formatDate } from '../../../shared/utils/date.utils';
import { ToBoolean } from '../../../shared/decorators/validators/to-boolean.decorator';

export class DeleteTaskDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID(4)
  id: string;

  @ApiProperty({ required: true, example: dateNowFormatted() })
  @IsNotEmpty()
  @IsDateString()
  @MinCustomDate(() => new Date())
  @Transform((date) => formatDate(date.value))
  date: string;

  @ApiProperty({ required: true })
  @ToBoolean()
  allEvents: boolean;
}
