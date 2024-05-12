import { createTasksFromSections, mapToTask } from '../tasks.utils';
import {
  createTaskMockDto,
  savedRepeatableTasksMock,
  savedTasksMock,
  storeIdMock,
  updateTaskMockDto,
} from '../../../modules/tasks/tests/__mocks__/tasks.mocks';
import { dateNowFormatted } from '../date.utils';
import { Task } from '../../../modules/tasks/entity/task.entity';

jest.mock('uuid', () => ({ v4: () => savedTasksMock[0].id }));

describe('TasksUtils', () => {
  it('should create n Tasks from n sections', () => {
    const tasks = createTasksFromSections(createTaskMockDto, savedRepeatableTasksMock);
    const updatedSavedTasks = savedTasksMock.map((task) => ({ ...task, isRepeatable: true }));
    expect(tasks).toEqual(updatedSavedTasks);
    expect(tasks.length).toEqual(savedTasksMock.length);
  });
  it('should create n Tasks from n sections with provided date and repeatableTaskId', () => {
    const tasks = createTasksFromSections(createTaskMockDto, savedRepeatableTasksMock, dateNowFormatted());
    const savedNewTasksMock: Task[] = [
      { ...savedTasksMock[0], repeatableTaskId: savedRepeatableTasksMock[0].id, isRepeatable: true },
    ];
    expect(tasks).toEqual(savedNewTasksMock);
    expect(tasks.length).toEqual(savedTasksMock.length);
  });
  describe('MapToTask', () => {
    it('should map task from updateTaskDto without repeatableId', () => {
      const task = mapToTask(savedTasksMock[0], updateTaskMockDto);
      expect(savedTasksMock[0]).toEqual(task);
    });
    it('should map task from updateTaskDto with repeatableId', () => {
      const repeatableTaskId = storeIdMock;
      const task = mapToTask(savedTasksMock[0], updateTaskMockDto, repeatableTaskId);
      const savedTaskMock = { ...savedTasksMock[0], repeatableTaskId };
      expect(savedTaskMock).toEqual(task);
    });
  });
});
