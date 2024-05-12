import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RepeatableTask, Task, TaskStatus } from '../entity/task.entity';
import { Errors } from '../../../shared/constants/errors.constants';

@Injectable()
export class TasksValidationService {
  validateTaskExists(task: Task | RepeatableTask): void {
    if (!task) {
      throw new NotFoundException(Errors.TaskNotFound);
    }
  }

  validateTaskDeleteStatus(taskStatus: TaskStatus): void {
    if (taskStatus !== TaskStatus.TODO) {
      throw new BadRequestException(Errors.TaskInProvidedStatusCantBeDeleted);
    }
  }

  validateTaskUpdateStatus(currentTaskStatus: TaskStatus, newTaskStatus: TaskStatus): void {
    if (newTaskStatus === TaskStatus.DONE && currentTaskStatus !== TaskStatus.INITIATED) {
      throw new BadRequestException(Errors.TaskMustBeInInitiatedStatus);
    }
    if (newTaskStatus === TaskStatus.INITIATED && currentTaskStatus !== TaskStatus.TODO) {
      throw new BadRequestException(Errors.TaskMustBeInTodoStatus);
    }
  }
}
