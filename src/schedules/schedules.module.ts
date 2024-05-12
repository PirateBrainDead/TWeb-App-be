import { Module } from '@nestjs/common';
import { TasksService } from '../modules/tasks/services/tasks.service';
import { TasksScheduleService } from './services/tasks-schedule.service';
import { Repository } from '../shared/repository/repository.service';
import { TasksValidationService } from '../modules/tasks/services/tasks-validation.service';
import { DeleteTaskService } from '../modules/tasks/services/delete-task.service';
import { UpdateTaskService } from '../modules/tasks/services/update-task.service';
import { TasksHelperService } from '../modules/tasks/services/tasks-helper.service';
import { StoresRepository } from '../modules/stores/stores.repository';
import { NotificationsService } from '../modules/notifications/notifications.service';
import { UsersRepository } from '../modules/users/users.repository';

@Module({
  providers: [
    TasksScheduleService,
    TasksService,
    UpdateTaskService,
    DeleteTaskService,
    TasksHelperService,
    Repository,
    TasksValidationService,
    StoresRepository,
    NotificationsService,
    UsersRepository,
  ],
  exports: [TasksScheduleService],
})
export class SchedulesModule {}
