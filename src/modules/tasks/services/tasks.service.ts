import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';
import { RepeatableTask, Task, TaskStatus } from '../entity/task.entity';
import { DB_KEYS } from '../../../shared/utils/db.utils';
import { createTasksFromSections } from '../../../shared/utils/tasks.utils';
import {
  addDaysWithFormat,
  dateNowFormatted,
  formatDate,
  isDateBetween,
  isRepeatable,
} from '../../../shared/utils/date.utils';
import { Repository } from '../../../shared/repository/repository.service';
import { DeleteTaskDto } from '../dto/delete-task.dto';
import { TasksValidationService } from './tasks-validation.service';
import { DeleteTaskService } from './delete-task.service';
import { UpdateTaskService } from './update-task.service';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TasksHelperService } from './tasks-helper.service';
import {
  createRepeatableTasksFromSections,
  findDailyRepeatableTasks,
  isRepeatableTaskSingleInstance,
} from '../../../shared/utils/repeatable-tasks.utils';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeleteTask, EventSyncStatus, TasksEvent } from '../dto/tasks.event';
import { EVENTS } from '../../../shared/constants/evens.constants';

@Injectable()
export class TasksService {
  constructor(
    private readonly deleteTaskService: DeleteTaskService,
    private readonly updateTaskService: UpdateTaskService,
    private readonly tasksHelperService: TasksHelperService,
    private readonly tasksValidationService: TasksValidationService,
    private readonly repository: Repository,
    private readonly cls: CellClsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findDailyByDate(date: string, storeId?: string): Promise<Task[]> {
    const dailyTasks = (
      await this.repository.findAll<Task>(DB_KEYS.TASKS.DAILY(storeId ?? this.cls.storeId, date))
    )?.map((t) => {
      return !t.repeatableTaskId ? { ...t, isRepeatable: false } : t;
    });

    if (date !== dateNowFormatted()) return dailyTasks;

    const repeatableTasks = await this.repository.findAll<RepeatableTask>(
      DB_KEYS.TASKS.REPEATS(storeId ?? this.cls.storeId),
    );

    const dailyRepeatableTasks = dailyTasks.filter((a) => a.repeatableTaskId);
    for (const task of dailyRepeatableTasks) {
      const repeatableTask = repeatableTasks.find((rTask) => rTask.id === task.repeatableTaskId);
      if (repeatableTask) {
        task.endDate = repeatableTask.endDate;
        task.repeatDaysInWeek = repeatableTask.repeatDaysInWeek;
        task.isRepeatable = isRepeatable(repeatableTask);
        continue;
      }
      task.isRepeatable = false;
    }

    return dailyTasks;
  }

  async findRepeatableByDate(date: string): Promise<RepeatableTask[]> {
    const repeatableTasks = await this.repository.findAll<RepeatableTask>(DB_KEYS.TASKS.REPEATS(this.cls.storeId));
    const todayTasks = (
      await this.repository.findAll<Task>(DB_KEYS.TASKS.DAILY(this.cls.storeId, dateNowFormatted()))
    )?.filter((task) => task?.repeatableTaskId);

    const dailyRepeatableTasks: RepeatableTask[] = [];
    const formattedStartDate = formatDate(date);
    const startDate = new Date(formattedStartDate);

    for (const repeatableTask of repeatableTasks) {
      const isRepeatableSingleInstance = isRepeatableTaskSingleInstance(date, repeatableTask);

      if (isRepeatableSingleInstance) {
        findDailyRepeatableTasks(formattedStartDate, repeatableTask, todayTasks, dailyRepeatableTasks);
        continue;
      }
      const isDayBetweenTaskDates = isDateBetween({
        date: formattedStartDate,
        startDate: repeatableTask.startDate,
        endDate: repeatableTask.endDate,
      });
      const isTaskRepeatDaysMatchedWithDay = repeatableTask.repeatDaysInWeek.includes(startDate.getDay());
      const isNotExcluded = !repeatableTask.excludeDays?.includes(formattedStartDate);

      if (isDayBetweenTaskDates && isTaskRepeatDaysMatchedWithDay && isNotExcluded) {
        findDailyRepeatableTasks(formattedStartDate, repeatableTask, todayTasks, dailyRepeatableTasks);
      }
    }

    return dailyRepeatableTasks;
  }

  async create(taskDto: CreateTaskDto): Promise<boolean> {
    if (taskDto.startDate === dateNowFormatted()) {
      let newRepeatableTasks: RepeatableTask[] = [];
      if (taskDto.repeatDaysInWeek.length) {
        const newStartDate = addDaysWithFormat(taskDto.startDate, 1);
        newRepeatableTasks = createRepeatableTasksFromSections({ ...taskDto, startDate: newStartDate });
        await this.tasksHelperService.saveRepeatableTasks(newStartDate, newRepeatableTasks, true);
      }
      const newDailyTasks = createTasksFromSections(taskDto, newRepeatableTasks);
      await this.tasksHelperService.saveDailyTasks(newDailyTasks);
    } else {
      const newRepeatableTasks = createRepeatableTasksFromSections(taskDto);
      await this.tasksHelperService.saveRepeatableTasks(taskDto.startDate, newRepeatableTasks, false);
    }

    return true;
  }

  async update(taskDto: UpdateTaskDto): Promise<boolean> {
    if (taskDto.date === dateNowFormatted()) {
      await this.updateTaskService.updateTodayTask(taskDto);
    } else {
      await this.updateTaskService.updateRepeatableTask(taskDto);
    }
    return true;
  }

  async updateStatus(taskDto: UpdateTaskStatusDto): Promise<boolean> {
    const dbKey = DB_KEYS.TASKS.DAILY(this.cls.storeId, formatDate(taskDto.currentDate));
    const task = await this.repository.findOne<Task>(dbKey, taskDto.id);
    this.tasksValidationService.validateTaskExists(task);
    this.tasksValidationService.validateTaskUpdateStatus(task.status, taskDto.status);

    task.status = taskDto.status;
    if (taskDto.status === TaskStatus.INITIATED) {
      task.actualStartTime = taskDto.currentTime;
    }
    if (taskDto.status === TaskStatus.DONE) {
      task.endTime = taskDto.currentTime;
    }
    await this.repository.update<Task>(dbKey, task);

    const taskEvent = {
      storeId: this.cls.storeId,
      syncStatus: EventSyncStatus.UPDATED,
      tasks: [task],
      taskIdForDelete: task.id,
      date: formatDate(taskDto.currentDate),
    } as TasksEvent;
    this.eventEmitter.emit(EVENTS.TASKS.DAILY, taskEvent);

    return true;
  }

  async delete(taskDto: DeleteTaskDto): Promise<boolean> {
    if (taskDto.date === dateNowFormatted()) {
      await this.deleteTaskService.deleteTodayTask(taskDto);
    } else {
      await this.deleteTaskService.deleteRepeatableTask(taskDto);
    }
    return true;
  }

  async deleteAllSectionTasks(sectionIds, storeId): Promise<boolean> {
    console.time();
    const dbKey = DB_KEYS.TASKS.ALL_BY_STORE(storeId);
    const matchingKeys = await this.repository.findAllMatchingKeys(dbKey);

    await Promise.all(
      matchingKeys.map(async (taskKey) => {
        const keyDate = taskKey.split('|')[2].split(':')[1];
        const dailyTasks = await this.findDailyByDate(keyDate, storeId);
        const deleteTasksArr: DeleteTask[] = [];
        for (const task of dailyTasks) {
          if (sectionIds.includes(task.sectionId)) {
            const deleteTaskDto: DeleteTask = {
              id: task.id,
              date: task.date,
              allEvents: true,
            };
            deleteTasksArr.push(deleteTaskDto);
          }
        }
        if (deleteTasksArr.length !== 0) await this.deleteTaskService.deleteManyTodayTasks(deleteTasksArr, storeId);
      }),
    );

    console.timeEnd();
    return true;
  }
}
