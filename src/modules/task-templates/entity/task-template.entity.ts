import { Checklist, TaskAttachment } from '../../../modules/tasks/entity/task.entity';

export type TaskTemplate = {
  id: string;
  name: string;
  description?: string;
  endDate?: string;
  startTime?: string;
  estimatedTime: string;
  prioritize?: boolean;
  sectionIds?: string[];
  repeatDaysInWeek?: number[];
  attachments?: TaskAttachment;
  checklist?: Checklist;
  comments?: string[];
};
