import { RepeatableTask, Task } from '../entity/task.entity';

export type TasksEvent = {
  storeId: string;
  syncStatus: EventSyncStatus;
  tasks: Task[] | RepeatableTask[];
  taskIdForDelete?: string;
  date?: string;
};

export type DeleteTask = {
  id: string;
  date: string;
  allEvents: boolean;
};

export enum EventSyncStatus {
  CREATED,
  UPDATED,
  DELETED,
  DELETE_FAILED,
}
