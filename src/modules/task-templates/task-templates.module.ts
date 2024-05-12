import { Module } from '@nestjs/common';
import { TaskTemplatesService } from './services/task-templates.service';
import { TaskTemplatesController } from './task-templates.controller';
import { Repository } from '../../shared/repository/repository.service';
import { TaskTemplatesValidationService } from './services/task-templates-validation.service';
import { TaskTemplatesRepository } from './task-templates.repository';

@Module({
  controllers: [TaskTemplatesController],
  providers: [TaskTemplatesService, TaskTemplatesValidationService, TaskTemplatesRepository, Repository],
})
export class TaskTemplatesModule {}
