import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecentActualTimes, RepeatableTask, Task, TaskStatus } from '../../modules/tasks/entity/task.entity';
import { DB_KEYS } from '../../shared/utils/db.utils';
import { formatDate, getTimeDifference, isDateBetween, sortDates } from '../../shared/utils/date.utils';
import { createDailyFromRepeatableTask } from '../../shared/utils/tasks.utils';
import { Repository } from '../../shared/repository/repository.service';
import { TasksHelperService } from '../../modules/tasks/services/tasks-helper.service';
import { findFirstNonExcludedDateFromTask } from '../../shared/utils/repeatable-tasks.utils';
import { StoresRepository } from '../../modules/stores/stores.repository';
import dayjs from 'dayjs';
import { TasksService } from '../../modules/tasks/services/tasks.service';
import { calculateActualTimeInMinutes, calculateAverageTime } from '../../shared/utils/statistics.utils';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import {
  PRIORITY_TASK_BODY,
  PRIORITY_TASK_TITLE,
  PRIORITY_MULTI_TASK_BODY,
} from '../../shared/constants/notifications.constants';

@Injectable()
export class TasksScheduleService {
  constructor(
    private readonly tasksHelperService: TasksHelperService,
    private readonly repository: Repository,
    private readonly storesRepository: StoresRepository,
    private readonly tasksService: TasksService,
    private readonly notificatiosService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRepeatableTaskConversion(): Promise<void> {
    const dateNow = new Date();
    const dateNowFormatted = formatDate(dateNow);
    console.log(`TasksSchedule repeatable tasks conversion starting... ${dateNow}`);
    const stores = await this.storesRepository.findAll();

    for (const store of stores) {
      const repeatableTasks = await this.repository.findAll<RepeatableTask>(DB_KEYS.TASKS.REPEATS(store.id));

      const tasksToCreate: Task[] = [];
      for (const [index, repeatableTask] of repeatableTasks.entries()) {
        if (dateNowFormatted > repeatableTask.endDate) {
          repeatableTasks.splice(index, 1);
          continue;
        }

        if (repeatableTask.excludeDays?.includes(dateNowFormatted)) {
          continue;
        }

        const isTodayBetweenTaskDates = isDateBetween({
          date: dateNowFormatted,
          startDate: repeatableTask.startDate,
          endDate: repeatableTask.endDate,
        });
        const isTaskRepeatDaysMatchedWithToday = repeatableTask.repeatDaysInWeek.includes(dateNow.getDay());
        if (isTodayBetweenTaskDates) {
          const nextStartDate = findFirstNonExcludedDateFromTask(repeatableTask);
          if (isTaskRepeatDaysMatchedWithToday) {
            const newTask = createDailyFromRepeatableTask(repeatableTask, !!nextStartDate);
            tasksToCreate.push(newTask);
          }

          if (nextStartDate) {
            repeatableTask.startDate = nextStartDate;
            if (repeatableTask.excludeDays) {
              const sortedExcludeDays = sortDates(repeatableTask.excludeDays);
              repeatableTask.excludeDays = sortedExcludeDays.filter((a) => dayjs(a).isAfter(nextStartDate));
            }
            continue;
          }

          repeatableTasks.splice(index, 1);
        }

        if (dateNowFormatted === repeatableTask.endDate) {
          repeatableTasks.splice(index, 1);
        }
      }

      await this.tasksHelperService.saveDailyTasks(tasksToCreate, store.id);
      await this.repository.upsert(DB_KEYS.TASKS.REPEATS(store.id), repeatableTasks);

      console.log(`TasksSchedule repeatable tasks conversion finished... ${new Date()}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleEstimatedTimeTaskAvg(): Promise<void> {
    console.log(`TasksSchedule estimated time for tasks starting...`);

    const dateNow = new Date();
    const dateNowFormatted = formatDate(dateNow);

    const stores = await this.storesRepository.findAll();

    for (const store of stores) {
      const todaysTasks = await this.tasksService.findDailyByDate(dateNowFormatted, store.id);

      for (const task of todaysTasks) {
        if (task.repeatableTaskId !== '' && task.status === TaskStatus.DONE) {
          const parentRepeatableTask = await this.repository.findOne<RepeatableTask>(
            DB_KEYS.TASKS.REPEATS(store.id),
            task.repeatableTaskId,
          );

          if (parentRepeatableTask) {
            const actualTime = calculateActualTimeInMinutes(task);

            const newEntry: RecentActualTimes = {
              taskId: task.id,
              taskDate: task.date,
              actualTime: actualTime,
            };

            if (!parentRepeatableTask.recentActualTimes) {
              parentRepeatableTask.recentActualTimes = [];
            }
            const recentTimes = [...parentRepeatableTask.recentActualTimes, newEntry].slice(1, 11); // Keep only the 10 most recent
            parentRepeatableTask.recentActualTimes = recentTimes;

            const averageEstimatedTime = calculateAverageTime(parentRepeatableTask.recentActualTimes);
            if (averageEstimatedTime) parentRepeatableTask.estimatedTime = averageEstimatedTime;
            await this.repository.update<RepeatableTask>(DB_KEYS.TASKS.REPEATS(store.id), parentRepeatableTask);
          }
        }
      }
    }

    console.log(`TasksSchedule  estimated time for tasks finished... `);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async sendReminderForPriorityTasks() {
    const dateNow = new Date();
    const dateNowFormatted = formatDate(dateNow);

    const stores = await this.storesRepository.findAll();
    for (const store of stores) {
      const todaysTasks = await this.tasksService.findDailyByDate(dateNowFormatted, store.id);
      const pendingPriorityTask = todaysTasks.filter((task) => {
        if (task.prioritize && task.status === TaskStatus.TODO) {
          const difference = getTimeDifference(
            formatDate(dateNow, 'YYYY-MM-DDTHH:mm'),
            `${dateNowFormatted}T${task.startTime}`,
          );
          if (difference == 10) return true;
        }
        return false;
      });
      if (pendingPriorityTask.length) {
        const notification = {
          title: PRIORITY_TASK_TITLE,
          body: `${pendingPriorityTask.length > 1 ? PRIORITY_MULTI_TASK_BODY : PRIORITY_TASK_BODY}`,
        };
        await this.notificatiosService.sendNotificationsToHq(notification, store.id);
      }
    }
    console.log(`TasksSchedule send priority task reminder finished... ${new Date()}`);
  }
}
