import dayjs from 'dayjs';
import { DATE_FORMAT } from '../constants/date.constants';
import { DB_KEYS } from './db.utils';
import { SortOrder } from './types';
import { RepeatableTask } from '../../modules/tasks/entity/task.entity';

export const DAYS_IN_WEEK = [0, 1, 2, 3, 4, 5, 6] as number[]; // 0 Sunday, 1 Monday...

export const formatDate = (date: string | Date, format = DATE_FORMAT): string => dayjs(date).format(format);
export const dateNowFormatted = (format = DATE_FORMAT): string => dayjs().format(format);

export const addDaysWithFormat = (dateToChange: string | Date, daysToAdd: number, format = DATE_FORMAT): string => {
  return dayjs(dateToChange, format).add(daysToAdd, 'day').format(format);
};
export const subtractDaysWithFormat = (
  dateToChange: string | Date,
  daysToSubtract: number,
  format = DATE_FORMAT,
): string => {
  return dayjs(dateToChange, format).subtract(daysToSubtract, 'day').format(format);
};

export const isDateBetween = ({
  date,
  startDate,
  endDate,
}: {
  date: string;
  startDate: string;
  endDate: string;
}): boolean => startDate <= date && date <= endDate;

export const getDays = (startingDate: string, duration: number, storeId: string): [string[], string[]] => {
  const startDate = new Date(startingDate);
  const endDate = new Date(startingDate);
  endDate.setDate(startDate.getDate() + duration);
  const dates: string[] = [];
  const dbKeys: string[] = [];
  while (startDate <= endDate) {
    dates.push(formatDate(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }

  return [dates, dbKeys];
};

export const getFirstStartDate = (start: string, end: string, repeatDaysInWeek: number[]): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  while (startDate <= endDate) {
    if (repeatDaysInWeek.includes(startDate.getDay())) {
      return dayjs(startDate).format(DATE_FORMAT);
    }
    startDate.setDate(startDate.getDate() + 1);
  }

  return end;
};

export const getAllDatesBetween = (start: string, end: string, repeatDaysInWeek: number[]): string[] => {
  const startDate = new Date(start);
  startDate.setDate(startDate.getDate() + 1);

  const endDate = new Date(end);
  const dates: string[] = [];
  while (startDate <= endDate) {
    if (repeatDaysInWeek.includes(startDate.getDay())) {
      dates.push(dayjs(startDate).format(DATE_FORMAT));
    }
    startDate.setDate(startDate.getDate() + 1);
  }

  return dates;
};

export const isRepeatable = ({
  excludeDays,
  repeatDaysInWeek,
  startDate: start,
  endDate: end,
}: RepeatableTask): boolean => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  while (startDate <= endDate) {
    if (repeatDaysInWeek.includes(startDate.getDay()) && !excludeDays?.includes(formatDate(startDate))) {
      return true;
    }
    startDate.setDate(startDate.getDate() + 1);
  }

  return false;
};

export const sortDates = (dates: string[], sortOrder: SortOrder = SortOrder.ASC): string[] => {
  return dates.sort((a, b) =>
    dayjs(sortOrder === SortOrder.ASC ? a : b).isAfter(sortOrder === SortOrder.ASC ? b : a, 'date') ? 1 : -1,
  );
};

export const getTimeDifference = (startTime: string, endTime: string) => {
  const time1 = dayjs(startTime);
  const time2 = dayjs(endTime);
  return time1.diff(time2, 'minute');
};
