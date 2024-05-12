import { Injectable } from '@nestjs/common';
import { TasksValidationService } from './tasks-validation.service';
import { Repository } from '../../../shared/repository/repository.service';
import { DeleteTaskDto } from '../dto/delete-task.dto';
import { DB_KEYS } from '../../../shared/utils/db.utils';
import { RepeatableTask, Task } from '../entity/task.entity';
import { EVENTS } from '../../../shared/constants/evens.constants';
import { addDaysWithFormat, dateNowFormatted, subtractDaysWithFormat } from '../../../shared/utils/date.utils';
import { TasksHelperService } from './tasks-helper.service';
import { DeleteTask, EventSyncStatus, TasksEvent } from '../dto/tasks.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CellClsService } from '../../libs/cls/cell-cls.service';

@Injectable()
export class DeleteTaskService {
  constructor(
    private readonly tasksHelperService: TasksHelperService,
    private readonly tasksValidationService: TasksValidationService,
    private readonly repository: Repository,
    private readonly eventEmitter: EventEmitter2,
    private readonly cls: CellClsService,
  ) {}

  async deleteTodayTask(taskDto: DeleteTaskDto, storeId?: string): Promise<void> {
    const dbKey = DB_KEYS.TASKS.DAILY(storeId ?? this.cls.storeId, taskDto.date);
    const task = await this.repository.findOne<Task>(dbKey, taskDto.id);
    this.tasksValidationService.validateTaskExists(task);
    this.tasksValidationService.validateTaskDeleteStatus(task.status);

    await this.repository.delete(dbKey, task.id);
    this.emitDeleteTaskEvent(taskDto.id, [], EVENTS.TASKS.DAILY);

    if (taskDto.allEvents) {
      await this.deleteRepeatableTaskInstance(task.repeatableTaskId);
    }
  }

  async deleteManyTodayTasks(taskDtos: DeleteTask[], storeId?: string): Promise<void> {
    const taskIds: string[] = [];
    const repeatableTaskIds: string[] = [];
    const dbKey = DB_KEYS.TASKS.DAILY(storeId ?? this.cls.storeId, taskDtos[0].date);

    for (const taskDto of taskDtos) {
      const task = await this.repository.findOne<Task>(dbKey, taskDto.id);
      this.tasksValidationService.validateTaskExists(task);
      taskIds.push(taskDto.id);
      if (task.repeatableTaskId !== '') {
        repeatableTaskIds.push(task.repeatableTaskId);
      }
    }
    await this.deleteRepeatableTaskInstanceForJob(repeatableTaskIds, storeId);
    await this.repository.deleteMany(dbKey, taskIds);
  }

  async deleteRepeatableTask(taskDto: DeleteTaskDto): Promise<void> {
    const repeatableTask = await this.tasksHelperService.getRepeatableTask(taskDto.id);

    if (!repeatableTask.repeatDaysInWeek.length) {
      await this.deleteRepeatableTaskInstance(taskDto.id);
      return;
    }

    if (taskDto.date === repeatableTask.startDate) {
      // prettier-ignore
      await this.deleteRepeatableTaskFromStart(taskDto, repeatableTask);
      return;
    }

    if (taskDto.date === repeatableTask.endDate) {
      await this.deleteRepeatableTaskFromEnd(repeatableTask);
      return;
    }

    await this.deleteRepeatableTaskFromMiddle(taskDto, repeatableTask);
  }

  private async deleteRepeatableTaskFromStart(taskDto: DeleteTaskDto, repeatableTask: RepeatableTask): Promise<void> {
    if (taskDto.allEvents) {
      await this.deleteRepeatableTaskInstance(taskDto.id);
      return;
    }
    repeatableTask.startDate = addDaysWithFormat(repeatableTask.startDate, 1);

    await this.repository.update<RepeatableTask>(DB_KEYS.TASKS.REPEATS(this.cls.storeId), repeatableTask);
    this.emitDeleteTaskEvent(repeatableTask.id, [repeatableTask]);
  }

  private async deleteRepeatableTaskFromEnd(repeatableTask: RepeatableTask): Promise<void> {
    repeatableTask.endDate = subtractDaysWithFormat(repeatableTask.endDate, 1);

    await this.repository.update<RepeatableTask>(DB_KEYS.TASKS.REPEATS(this.cls.storeId), repeatableTask);
    this.emitDeleteTaskEvent(repeatableTask.id, [repeatableTask]);
  }

  private async deleteRepeatableTaskFromMiddle(taskDto: DeleteTaskDto, repeatableTask: RepeatableTask): Promise<void> {
    if (taskDto.allEvents) {
      repeatableTask.endDate = subtractDaysWithFormat(taskDto.date, 1);
      await this.repository.update<RepeatableTask>(DB_KEYS.TASKS.REPEATS(this.cls.storeId), repeatableTask);
      this.emitDeleteTaskEvent(repeatableTask.id, [repeatableTask]);
      return;
    }
    repeatableTask.excludeDays = repeatableTask.excludeDays
      ? [...repeatableTask.excludeDays, taskDto.date]
      : [taskDto.date];

    await this.repository.update<RepeatableTask>(DB_KEYS.TASKS.REPEATS(this.cls.storeId), repeatableTask);
    this.emitDeleteTaskEvent(repeatableTask.id, [repeatableTask]);
  }

  private async deleteRepeatableTaskInstance(taskIdForDelete: string) {
    await this.updateIfOnlyOneTaskExists(taskIdForDelete);

    await this.repository.delete(DB_KEYS.TASKS.REPEATS(this.cls.storeId), taskIdForDelete);
    this.emitDeleteTaskEvent(taskIdForDelete, []);
  }

  private async deleteRepeatableTaskInstanceForJob(taskIdsForDelete: string[], storeId?: string) {
    await this.repository.deleteMany(DB_KEYS.TASKS.REPEATS(storeId ?? this.cls.storeId), taskIdsForDelete);
  }

  async updateIfOnlyOneTaskExists(repeatableTaskId: string): Promise<void> {
    const dbKey = DB_KEYS.TASKS.DAILY(this.cls.storeId, dateNowFormatted());
    const tasks = await this.repository.findAll<Task>(dbKey);
    const task = tasks.find((a) => a.repeatableTaskId === repeatableTaskId);

    if (task) {
      task.repeatableTaskId = '';
      await this.repository.update<Task>(dbKey, task);
      task.isRepeatable = false;
      const taskEvent = {
        storeId: this.cls.storeId,
        syncStatus: EventSyncStatus.UPDATED,
        tasks: [task],
        taskIdForDelete: task.id,
        date: dateNowFormatted(),
      } as TasksEvent;
      this.eventEmitter.emit(EVENTS.TASKS.DAILY, taskEvent);
    }
  }

  private emitDeleteTaskEvent(taskIdForDelete: string, tasks: RepeatableTask[], event = EVENTS.TASKS.REPEATABLE): void {
    const tasksEvent = {
      storeId: this.cls.storeId,
      syncStatus: EventSyncStatus.DELETED,
      taskIdForDelete,
      tasks,
      date: event === EVENTS.TASKS.DAILY ? dateNowFormatted() : undefined,
    } as TasksEvent;
    this.eventEmitter.emit(event, tasksEvent);
  }
}
