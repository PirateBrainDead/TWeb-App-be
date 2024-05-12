import { CreateTaskDto } from '../../modules/tasks/dto/create-task.dto';
import { RepeatableTask, Task, TaskStatus } from '../../modules/tasks/entity/task.entity';
import { v4 as uuidv4 } from 'uuid';
import { UpdateTaskDto } from '../../modules/tasks/dto/update-task.dto';
import { dateNowFormatted } from './date.utils';

export const allTasks = '0';

export const createTasksFromSections = (
  taskDto: CreateTaskDto,
  repeatableTasks: RepeatableTask[],
  date: string = undefined,
): Task[] => {
  return taskDto.sectionIds.map((sectionId, index) => {
    const isRepeatable = repeatableTasks.length > 0;
    const repeatableTask = isRepeatable ? repeatableTasks[index] : undefined;
    return {
      id: uuidv4(),
      name: taskDto.name,
      description: taskDto.description,
      date: date ?? taskDto.startDate,
      startTime: taskDto.startTime,
      status: TaskStatus.TODO,
      prioritize: taskDto.prioritize,
      sectionId,
      repeatableTaskId: repeatableTask?.id ?? '',
      isRepeatable,
      endDate: repeatableTask?.endDate,
      estimatedTime: taskDto.estimatedTime,
      repeatDaysInWeek: repeatableTask?.repeatDaysInWeek,
      recentActualTimes: repeatableTask?.recentActualTimes,
      checklist: taskDto.checklist,
      attachments: taskDto?.attachments,
      comments: taskDto?.comments,
    } as Task;
  });
};

export const createDailyFromRepeatableTask = (repeatableTask: RepeatableTask, isRepeatable: boolean): Task => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { startDate, endDate, repeatDaysInWeek, ...task } = repeatableTask;
  return {
    ...task,
    id: uuidv4(),
    date: dateNowFormatted(),
    status: TaskStatus.TODO,
    repeatableTaskId: isRepeatable ? repeatableTask.id : '',
    endDate: repeatableTask.endDate,
    repeatDaysInWeek: repeatableTask.repeatDaysInWeek,
  } as Task;
};

export const mapToTask = (task: Task, taskDto: UpdateTaskDto, repeatableTaskId?: string): Task => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { repeatDaysInWeek, allEvents, endDate, ...restDto } = taskDto;
  return { ...task, ...restDto, repeatableTaskId: repeatableTaskId ?? task.repeatableTaskId } as Task;
};
