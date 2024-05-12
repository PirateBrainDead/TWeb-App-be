import {
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
import { Transform, TransformFnParams } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { addDaysWithFormat, DAYS_IN_WEEK, formatDate } from '../../../shared/utils/date.utils';
import { REG_EXP } from '../../../shared/constants/reg-exp.constants';
import { IsAttachment } from '../../../shared/decorators/validators/is-attachment.decorator';
import { TaskAttachment } from '../../../modules/tasks/entity/task.entity';
import { ChecklistDto } from '../../../modules/tasks/dto/create-task.dto';
import { IsChecklist } from '../../../shared/decorators/validators/is-checklist.decorator';
import { IsComment } from '../../../shared/decorators/validators/is-comment.decorator';

export class CreateTaskTemplateDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(40)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  sectionIds?: string[];

  @ApiProperty({ required: false, example: addDaysWithFormat(new Date(), 10) })
  @IsOptional()
  @IsDateString()
  @Transform((date) => formatDate(date.value))
  endDate?: string;

  @ApiProperty({ required: false, example: DAYS_IN_WEEK, description: '0-Sunday, 1-Monday etc..' })
  @IsOptional()
  @IsArray()
  @Max(6, { each: true })
  @Min(0, { each: true })
  @ArrayUnique()
  repeatDaysInWeek?: number[];

  @ApiProperty({ required: false, example: '14:10' })
  @IsOptional()
  @ValidateIf((task) => task.startTime)
  @Matches(new RegExp(REG_EXP.TIME_24H), { message: 'Time must be in 24h format' })
  startTime?: string;

  @ApiProperty({ required: true, example: '00:30', description: '00:15 (time in min), 01:20' })
  @IsNotEmpty()
  estimatedTime: string;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  prioritize?: boolean;

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

export class UpdateTaskTemplateDto extends CreateTaskTemplateDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUUID(4)
  id: string;
}
