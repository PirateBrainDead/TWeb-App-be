import { Module } from '@nestjs/common';
import { TasksService } from './services/tasks.service';
import { TasksController } from './tasks.controller';
import { Repository } from '../../shared/repository/repository.service';
import { TasksValidationService } from './services/tasks-validation.service';
import { DeleteTaskService } from './services/delete-task.service';
import { UpdateTaskService } from './services/update-task.service';
import { TasksHelperService } from './services/tasks-helper.service';

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    UpdateTaskService,
    DeleteTaskService,
    TasksHelperService,
    TasksValidationService,
    Repository,
  ],
  exports: [TasksService, DeleteTaskService],
})
export class TasksModule {}
