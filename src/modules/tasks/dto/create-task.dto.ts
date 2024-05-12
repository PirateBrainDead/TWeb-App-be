import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MinCustomDate } from '../../../shared/decorators/validators/min-date.decorator';
import { addDaysWithFormat, dateNowFormatted, DAYS_IN_WEEK, formatDate } from '../../../shared/utils/date.utils';
import { IsGreaterOrEqualTo } from '../../../shared/decorators/validators/is-greater-or-equal-to.decorator';
import { REG_EXP } from '../../../shared/constants/reg-exp.constants';
import { TaskAttachment } from '../entity/task.entity';
import { IsAttachment } from '../../../shared/decorators/validators/is-attachment.decorator';
import { IsComment } from '../../../shared/decorators/validators/is-comment.decorator';
import { IsChecklist } from '../../../shared/decorators/validators/is-checklist.decorator';

class ChecklistItemDto {
  @ApiProperty({ example: 'Item 1' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: true, type: Boolean })
  @IsBoolean()
  @IsNotEmpty()
  isChecked: boolean;
}

export class ChecklistDto {
  @ApiProperty({
    type: ChecklistItemDto,
    isArray: true,
    description: 'Items of the checklist',
  })
  @IsArray()
  @ApiProperty()
  @Type(() => ChecklistItemDto)
  @IsOptional()
  items?: ChecklistItemDto[];
}

export class CreateTaskDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(40)
  name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(1000)
  description: string;

  @ApiProperty({ required: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(4, { each: true })
  sectionIds: string[];

  @ApiProperty({ required: true, example: dateNowFormatted() })
  @IsNotEmpty()
  @IsDateString()
  @MinCustomDate(() => new Date())
  @Transform((date) => formatDate(date.value))
  startDate: string;

  @ApiProperty({ required: false, example: addDaysWithFormat(new Date(), 10) })
  @ValidateIf((task) => task.repeatDaysInWeek.length)
  @IsOptional()
  @IsDateString()
  @IsGreaterOrEqualTo('startDate')
  @Transform((date) => formatDate(date.value))
  endDate: string;

  @ApiProperty({ required: true, example: '00:30', description: '00:15 (time in min), 01:20' })
  @IsNotEmpty()
  estimatedTime: string;

  @ApiProperty({ required: false, example: DAYS_IN_WEEK, description: '0-Sunday, 1-Monday etc..' })
  @ValidateIf((task) => task.endDate)
  @IsArray()
  @Max(6, { each: true })
  @Min(0, { each: true })
  @ArrayUnique()
  repeatDaysInWeek: number[] = [];

  @ApiProperty({ required: false, example: '14:10' })
  @IsOptional()
  @ValidateIf((task) => task.startTime)
  @Matches(new RegExp(REG_EXP.TIME_24H), { message: 'Time must be in 24h format' })
  actualStartTime?: string;

  @ApiProperty({ required: false, example: '14:10' })
  @IsOptional()
  @ValidateIf((task) => task.startTime)
  @Matches(new RegExp(REG_EXP.TIME_24H), { message: 'Time must be in 24h format' })
  startTime?: string;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsBoolean()
  prioritize = false;

  @ApiProperty({ required: false, example: { admin: [], hq: [] } })
  @IsOptional()
  @IsAttachment()
  attachments?: TaskAttachment;

  @ApiProperty({ required: false, example: ['comment 1', 'comment 2'] })
  @IsOptional()
  @IsComment()
  comments?: string[];

  @ApiProperty({
    required: false,
    description: 'Checklist associated with the task',
    type: ChecklistDto,
  })
  @IsOptional()
  @IsChecklist()
  checklist?: ChecklistDto;
}
