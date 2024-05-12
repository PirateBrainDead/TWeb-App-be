import { IsDateString, IsNotEmpty, IsOptional, IsUUID, ValidateIf } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { addDaysWithFormat, dateNowFormatted, formatDate } from '../../../shared/utils/date.utils';
import { Transform } from 'class-transformer';
import { ToBoolean } from '../../../shared/decorators/validators/to-boolean.decorator';
import { IsGreaterOrEqualTo } from '../../../shared/decorators/validators/is-greater-or-equal-to.decorator';

export class UpdateTaskDto extends OmitType(CreateTaskDto, ['sectionIds', 'startDate', 'endDate'] as const) {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID(4)
  id: string;

  @ApiProperty({ required: false, example: dateNowFormatted() })
  @IsDateString()
  @Transform((date) => formatDate(date.value))
  date: string;

  @ApiProperty({ required: false, example: addDaysWithFormat(new Date(), 10) })
  @ValidateIf((task) => task.repeatDaysInWeek.length)
  @IsOptional()
  @IsDateString()
  @IsGreaterOrEqualTo('date')
  @Transform((date) => formatDate(date.value))
  endDate: string;

  @ApiProperty({ required: true })
  @ToBoolean()
  allEvents: boolean;
}
