import { Injectable } from '@nestjs/common';
import { TasksValidationService } from './tasks-validation.service';
import { Repository } from '../../../shared/repository/repository.service';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { DB_KEYS } from '../../../shared/utils/db.utils';
import { RepeatableTask, Task } from '../entity/task.entity';
import { EVENTS } from '../../../shared/constants/evens.constants';
import { EventSyncStatus, TasksEvent } from '../dto/tasks.event';
import {
  addDaysWithFormat,
  dateNowFormatted,
  formatDate,
  isRepeatable,
  subtractDaysWithFormat,
} from '../../../shared/utils/date.utils';
import { v4 as uuidv4 } from 'uuid';
import { mapToTask } from '../../../shared/utils/tasks.utils';
import { TasksHelperService } from './tasks-helper.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createRepeatableTask } from '../../../shared/utils/repeatable-tasks.utils';
import { CellClsService } from '../../libs/cls/cell-cls.service';

@Injectable()
export class UpdateTaskService {
  constructor(
    private readonly tasksHelperService: TasksHelperService,
    private readonly tasksValidationService: TasksValidationService,
    private readonly repository: Repository,
    private readonly eventEmitter: EventEmitter2,
    private readonly cls: CellClsService,
  ) {}

  async updateTodayTask(taskDto: UpdateTaskDto): Promise<boolean> {
    const taskDailyDbKey = DB_KEYS.TASKS.DAILY(this.cls.storeId, taskDto.date);
    const task = await this.repository.findOne<Task>(taskDailyDbKey, taskDto.id);
    this.tasksValidationService.validateTaskExists(task);
    // this.tasksValidationService.validateTaskDeleteStatus(task.status);

    if (task.repeatableTaskId) {
      const existingRepeatableTask = await this.updateTodayRepeatableTask(task, taskDto);
      await this.updateSingleDailyTask(task, taskDto, existingRepeatableTask);
      return true;
    }

    let newRepeatableTask: RepeatableTask;
    if (taskDto.repeatDaysInWeek.length) {
      newRepeatableTask = createRepeatableTask(taskDto, task.sectionId);
      await this.tasksHelperService.saveRepeatableTasks(taskDto.date, [newRepeatableTask], true);
    }

    await this.updateSingleDailyTask(task, taskDto, newRepeatableTask);
    return true;
  }

  async updateRepeatableTask(taskDto: UpdateTaskDto): Promise<void> {
    const { date, ...restDto } = taskDto;
    const repeatableTask = await this.tasksHelperService.getRepeatableTask(taskDto.id);

    if (date === repeatableTask.startDate) {
      await this.updateRepeatableTaskFromStart(restDto, repeatableTask);
      return;
    }
    if (date === repeatableTask.endDate) {
      await this.updateRepeatableTaskFromEnd(restDto, repeatableTask);
      return;
    }

    await this.updateRepeatableTaskFromMiddle(taskDto, repeatableTask);
  }

  private async updateSingleDailyTask(
    task: Task,
    taskDto: UpdateTaskDto,
    newRepeatableTask?: RepeatableTask,
  ): Promise<void> {
    task = mapToTask(task, taskDto, newRepeatableTask?.id);
    const dbKey = DB_KEYS.TASKS.DAILY(this.cls.storeId, taskDto.date);
    await this.repository.update<Task>(dbKey, task);

    if (newRepeatableTask) {
      task.endDate = newRepeatableTask.endDate;
      task.repeatDaysInWeek = newRepeatableTask.repeatDaysInWeek;
      task.isRepeatable = isRepeatable(newRepeatableTask);
    } else {
      task.isRepeatable = false;
    }

    this.emitUpdateTaskEvent([task], task.id, EVENTS.TASKS.DAILY);
  }

  private async updateTodayRepeatableTask(task: Task, taskDto: UpdateTaskDto): Promise<RepeatableTask | undefined> {
    const dbKey = DB_KEYS.TASKS.REPEATS(this.cls.storeId);
    let repeatableTask = await this.tasksHelperService.getRepeatableTask(task.repeatableTaskId);

    if (!taskDto.repeatDaysInWeek.length) {
      await this.repository.delete(dbKey, repeatableTask.id);
      this.emitUpdateTaskEvent([], repeatableTask.id);
      task.repeatableTaskId = '';
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, allEvents, date, ...restDto } = taskDto;

    if (allEvents) {
      const dto = { ...restDto, id: task.repeatableTaskId } as Omit<UpdateTaskDto, 'date'>;
      repeatableTask = { ...repeatableTask, ...dto };
      await this.repository.update<RepeatableTask>(dbKey, repeatableTask);
      this.emitUpdateTaskEvent([repeatableTask], repeatableTask.id);
      return repeatableTask;
    }

    task.repeatableTaskId = '';
    return undefined;
  }

  private async updateRepeatableTaskFromStart(
    taskDto: Omit<UpdateTaskDto, 'date'>,
    repeatableTask: RepeatableTask,
  ): Promise<void> {
    const dbKey = DB_KEYS.TASKS.REPEATS(this.cls.storeId);

    const { allEvents, ...dto } = taskDto;
    if (allEvents) {
      const updatedRepeatableTask = { ...repeatableTask, ...dto };

      await this.repository.update<RepeatableTask>(dbKey, updatedRepeatableTask);
      this.emitUpdateTaskEvent([updatedRepeatableTask], updatedRepeatableTask.id);
      return;
    }
    const initialRepeatableTask = { ...repeatableTask };

    const newStartDate = addDaysWithFormat(repeatableTask.startDate, 1);
    repeatableTask.startDate = formatDate(newStartDate);

    const newRepeatableTask = {
      ...initialRepeatableTask,
      ...dto,
      id: uuidv4(),
      repeatDaysInWeek: [],
      endDate: initialRepeatableTask.startDate,
    } as RepeatableTask;

    await this.repository.update<RepeatableTask>(dbKey, repeatableTask);
    await this.repository.create<RepeatableTask>(dbKey, newRepeatableTask);

    this.emitUpdateTaskEvent([repeatableTask, newRepeatableTask], repeatableTask.id);
  }

  private async updateRepeatableTaskFromEnd(
    taskDto: Omit<UpdateTaskDto, 'date'>,
    repeatableTask: RepeatableTask,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { allEvents, ...restDto } = taskDto;
    const initialRepeatableTask = { ...repeatableTask };

    repeatableTask.endDate = subtractDaysWithFormat(repeatableTask.endDate, 1);

    const newRepeatableTask = {
      ...initialRepeatableTask,
      ...restDto,
      id: uuidv4(),
      startDate: initialRepeatableTask.endDate,
    } as RepeatableTask;
    if (!taskDto.allEvents) newRepeatableTask.repeatDaysInWeek = [];

    const dbKey = DB_KEYS.TASKS.REPEATS(this.cls.storeId);
    await this.repository.update<RepeatableTask>(dbKey, repeatableTask);
    await this.repository.create<RepeatableTask>(dbKey, newRepeatableTask);

    this.emitUpdateTaskEvent([repeatableTask, newRepeatableTask], repeatableTask.id);
  }

  private async updateRepeatableTaskFromMiddle(taskDto: UpdateTaskDto, repeatableTask: RepeatableTask): Promise<void> {
    const { allEvents, date, ...restDto } = taskDto;

    let newRepeatableTask = {
      ...repeatableTask,
      ...restDto,
      id: uuidv4(),
      startDate: date,
    } as RepeatableTask;

    if (allEvents) {
      repeatableTask.endDate = subtractDaysWithFormat(date, 1);
    } else {
      repeatableTask.excludeDays = repeatableTask.excludeDays ? [...repeatableTask.excludeDays, date] : [date];
      newRepeatableTask = { ...newRepeatableTask, repeatDaysInWeek: [], endDate: date };
    }

    const dbKey = DB_KEYS.TASKS.REPEATS(this.cls.storeId);
    await this.repository.update<RepeatableTask>(dbKey, repeatableTask);
    await this.repository.create<RepeatableTask>(dbKey, newRepeatableTask);

    this.emitUpdateTaskEvent([repeatableTask, newRepeatableTask], repeatableTask.id);
  }

  private emitUpdateTaskEvent(
    tasks: Task[] | RepeatableTask[],
    taskIdForDelete: string,
    event = EVENTS.TASKS.REPEATABLE,
  ): void {
    const taskEvent = {
      storeId: this.cls.storeId,
      syncStatus: EventSyncStatus.UPDATED,
      tasks,
      date: event === EVENTS.TASKS.DAILY ? dateNowFormatted() : undefined,
      taskIdForDelete,
    } as TasksEvent;
    this.eventEmitter.emit(event, taskEvent);
  }
}
