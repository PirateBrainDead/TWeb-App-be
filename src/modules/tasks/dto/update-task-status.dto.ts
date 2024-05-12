import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsUUID, Matches, NotEquals, ValidateIf } from 'class-validator';
import { TaskStatus } from '../entity/task.entity';
import { dateNowFormatted, formatDate } from '../../../shared/utils/date.utils';
import { Transform } from 'class-transformer';
import { REG_EXP } from '../../../shared/constants/reg-exp.constants';

export class UpdateTaskStatusDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID(4)
  id: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEnum(TaskStatus)
  @NotEquals(TaskStatus.TODO, { message: `Task can't be moved to TODO` })
  status: TaskStatus;

  @ApiProperty({ required: true, example: dateNowFormatted() })
  @IsNotEmpty()
  @IsDateString()
  @Transform((date) => formatDate(date.value))
  currentDate: string;

  @ApiProperty({ required: true, example: '14:10' })
  @IsNotEmpty()
  @ValidateIf((task) => task.currentTime)
  @Matches(new RegExp(REG_EXP.TIME_24H), { message: 'Time must be in 24h format' })
  currentTime: string;
}
