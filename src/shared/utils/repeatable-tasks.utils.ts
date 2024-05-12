import { UpdateTaskDto } from '../../modules/tasks/dto/update-task.dto';
import { RepeatableTask, Task } from '../../modules/tasks/entity/task.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreateTaskDto } from '../../modules/tasks/dto/create-task.dto';
import {
  addDaysWithFormat,
  getAllDatesBetween,
  getFirstStartDate,
  isDateBetween,
  isRepeatable,
  sortDates,
} from './date.utils';
import { SortOrder } from './types';

export const createRepeatableTasksFromSections = (taskDto: CreateTaskDto): RepeatableTask[] => {
  const { sectionIds, startDate, ...task } = taskDto;
  const newStartDate = getFirstStartDate(startDate, taskDto.endDate, taskDto.repeatDaysInWeek);
  return sectionIds.map((sectionId) => {
    return {
      ...task,
      id: uuidv4(),
      sectionId,
      startDate: newStartDate,
    } as RepeatableTask;
  });
};

export const createRepeatableTask = (taskDto: UpdateTaskDto, sectionId: string): RepeatableTask => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { allEvents, date, id, ...restDto } = taskDto;
  return {
    ...restDto,
    id: uuidv4(),
    sectionId,
    startDate: addDaysWithFormat(date, 1),
  } as RepeatableTask;
};

export const findFirstNonExcludedDate = (dates: string[], excludedDates: string[]): string | undefined => {
  for (const date of dates) {
    if (!excludedDates.includes(date)) {
      return date;
    }
  }
  return undefined;
};

export const findFirstNonExcludedDateFromTask = (
  repeatableTask: RepeatableTask,
  startDate = repeatableTask.startDate,
  endDate = repeatableTask.endDate,
  sortOrder: SortOrder = SortOrder.ASC,
): string | undefined => {
  const datesBetween = getAllDatesBetween(startDate, endDate, repeatableTask.repeatDaysInWeek);
  const sortedDates = sortDates(datesBetween, sortOrder);
  return findFirstNonExcludedDate(sortedDates, repeatableTask.excludeDays ?? []);
};

export const findDailyRepeatableTask = (date: string, repeatableTask: RepeatableTask): RepeatableTask => {
  const startDate = new Date(date);

  const isDayBetweenTaskDates = isDateBetween({
    date,
    startDate: repeatableTask.startDate,
    endDate: repeatableTask.endDate,
  });
  const isTaskRepeatDaysMatchedWithDay = repeatableTask.repeatDaysInWeek.includes(startDate.getDay());
  const isNotExcluded = !repeatableTask.excludeDays?.includes(date);

  if (isDayBetweenTaskDates && isTaskRepeatDaysMatchedWithDay && isNotExcluded) {
    const isTaskRepeatable = isRepeatable({
      ...repeatableTask,
      excludeDays: [...(repeatableTask.excludeDays ?? []), date],
    });
    return { ...repeatableTask, isRepeatable: isTaskRepeatable };
  }

  return isRepeatableTaskSingleInstance(date, repeatableTask) ? repeatableTask : undefined;
};

export const findDailyRepeatableTasks = (
  formattedStartDate: string,
  repeatableTask: RepeatableTask,
  todayTasks: Task[],
  dailyRepeatableTasks: RepeatableTask[],
): void => {
  let isTaskRepeatable = isRepeatable({
    ...repeatableTask,
    excludeDays: [...(repeatableTask.excludeDays ?? []), formattedStartDate],
  });
  if (!isTaskRepeatable) {
    const todayTaskExists = todayTasks.some((todayTask) => todayTask.repeatableTaskId === repeatableTask.id);
    if (todayTaskExists) isTaskRepeatable = true;
  }
  dailyRepeatableTasks.push({ ...repeatableTask, isRepeatable: isTaskRepeatable });
};

export const isRepeatableTaskSingleInstance = (date: string, repeatableTask: RepeatableTask): boolean => {
  return repeatableTask.startDate === repeatableTask.endDate && repeatableTask.startDate === date;
};
