import { CreateTaskDto } from '../dto/create-task.dto';

export type RecentActualTimes = {
  taskId: string;
  taskDate: string;
  actualTime: string;
};

export type Task = {
  id: string;
  name: string;
  description: string;
  date: string;
  actualStartTime?: string;
  startTime?: string;
  endTime?: string;
  estimatedTime: string;
  status: TaskStatus;
  prioritize: boolean;
  sectionId: string;
  repeatableTaskId: string;
  recentActualTimes: RecentActualTimes[];
  isRepeatable?: boolean;
  endDate?: string;
  repeatDaysInWeek?: number[];
  attachments?: TaskAttachment;
  checklist?: Checklist;
  comments?: string[];
};

export type ChecklistItem = {
  name: string;
  isChecked: boolean;
};

export type Checklist = {
  items?: ChecklistItem[];
};

export type TaskAttachment = {
  admin?: string[];
  hq?: string[];
};

export type RepeatableTask = Omit<CreateTaskDto, 'sectionIds'> & {
  id: string;
  sectionId: string;
  excludeDays?: string[];
  isRepeatable?: boolean;
  recentActualTimes?: RecentActualTimes[];
  checklist?: Checklist;
  comments?: string[];
};

export enum TaskStatus {
  TODO,
  INITIATED,
  DONE,
}
