import { TaskTemplate } from '../entity/task-template.entity';
import { EventSyncStatus } from '../../tasks/dto/tasks.event';

export type TaskTemplatesEvent = {
  userId: string;
  syncStatus: EventSyncStatus;
  taskTemplates: TaskTemplate[];
  idForDelete?: string;
};
