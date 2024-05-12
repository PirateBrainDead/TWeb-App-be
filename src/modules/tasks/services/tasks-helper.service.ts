import { Injectable } from '@nestjs/common';
import { RepeatableTask, Task } from '../entity/task.entity';
import { DB_KEYS } from '../../../shared/utils/db.utils';
import { EventSyncStatus, TasksEvent } from '../dto/tasks.event';
import { EVENTS } from '../../../shared/constants/evens.constants';
import { Repository } from '../../../shared/repository/repository.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TasksValidationService } from './tasks-validation.service';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { dateNowFormatted } from '../../../shared/utils/date.utils';
import { findDailyRepeatableTask } from '../../../shared/utils/repeatable-tasks.utils';

@Injectable()
export class TasksHelperService {
  constructor(
    private readonly tasksValidationService: TasksValidationService,
    private readonly repository: Repository,
    private readonly eventEmitter: EventEmitter2,
    private readonly cls: CellClsService,
  ) {}

  async saveDailyTasks(tasks: Task[], storeId?: string): Promise<void> {
    if (!tasks.length) return;

    const date = dateNowFormatted();
    const id = storeId ?? this.cls.storeId;

    await this.repository.createMany(DB_KEYS.TASKS.DAILY(id, date), tasks);
    const taskEvent = {
      storeId: id,
      syncStatus: EventSyncStatus.CREATED,
      date,
      tasks,
    } as TasksEvent;
    this.eventEmitter.emit(EVENTS.TASKS.DAILY, taskEvent);
  }

  async saveRepeatableTasks(
    startDate: string,
    newRepeatableTasks: RepeatableTask[],
    dailyTaskExist: boolean,
  ): Promise<void> {
    await this.repository.createMany(DB_KEYS.TASKS.REPEATS(this.cls.storeId), newRepeatableTasks);

    for (const task of newRepeatableTasks) {
      const dailyRepeatableTask = findDailyRepeatableTask(startDate, task);
      if (!dailyRepeatableTask) {
        task.isRepeatable = false;
        continue;
      }

      if (dailyRepeatableTask) {
        if (!dailyRepeatableTask.isRepeatable && dailyTaskExist) {
          task.isRepeatable = true;
          continue;
        }
        task.isRepeatable = true;
      }
    }

    const taskEvent = {
      storeId: this.cls.storeId,
      syncStatus: EventSyncStatus.CREATED,
      tasks: newRepeatableTasks,
    } as TasksEvent;
    this.eventEmitter.emit(EVENTS.TASKS.REPEATABLE, taskEvent);
  }

  async getRepeatableTask(taskId: string): Promise<RepeatableTask> {
    const repeatableTask = await this.repository.findOne<RepeatableTask>(
      DB_KEYS.TASKS.REPEATS(this.cls.storeId),
      taskId,
    );
    this.tasksValidationService.validateTaskExists(repeatableTask);
    return repeatableTask;
  }
}
