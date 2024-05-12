import {
  savedRepeatableTasksMock,
  savedTasksMock,
  updateTaskMockDto,
} from '../../../modules/tasks/tests/__mocks__/tasks.mocks';
import {
  createRepeatableTask,
  findFirstNonExcludedDate,
  findFirstNonExcludedDateFromTask,
} from '../repeatable-tasks.utils';
import { addDaysWithFormat, dateNowFormatted } from '../date.utils';
import { RepeatableTask } from '../../../modules/tasks/entity/task.entity';

jest.mock('uuid', () => ({ v4: () => savedTasksMock[0].id }));

describe('RepeatableTasksUtils', () => {
  describe('CreateRepeatableTask', () => {
    it('should create repeatableTask from UpdateTaskDto', () => {
      const repeatableTask = createRepeatableTask(updateTaskMockDto, savedTasksMock[0].sectionId);
      const savedRepeatableTask = {
        ...savedRepeatableTasksMock[0],
        startDate: addDaysWithFormat(savedTasksMock[0].date, 1),
      };
      expect(repeatableTask).toEqual(savedRepeatableTask);
    });
  });
  describe('findFirstNonExcludedDate', () => {
    it('should not find firstNonExcludedDate', () => {
      const datesBetween = ['2023-03-03', '2023-03-04', '2023-03-05'];
      const excludeDates = ['2023-03-03', '2023-03-05', '2023-03-04'];
      const firstNonExcludedDate = findFirstNonExcludedDate(datesBetween, excludeDates);

      expect(firstNonExcludedDate).toStrictEqual(undefined);
    });
    it('should find firstNonExcludedDate', () => {
      const datesBetween = ['2023-03-03', '2023-03-04', '2023-03-05'];
      const excludeDates = ['2023-03-03', '2023-03-05'];
      const firstNonExcludedDate = findFirstNonExcludedDate(datesBetween, excludeDates);

      expect(firstNonExcludedDate).toStrictEqual('2023-03-04');
    });
  });
  describe('findFirstNonExcludedDateFromTask', () => {
    it('should not find firstNonExcludedDateFromTask', () => {
      const firstNonExcludedDate = findFirstNonExcludedDateFromTask(
        { ...savedRepeatableTasksMock[0], repeatDaysInWeek: [0, 1, 2, 3, 4, 5, 6] },
        '2023-03-03',
        '2023-03-05',
      );

      expect(firstNonExcludedDate).toStrictEqual('2023-03-04');
    });
    it('should find firstNonExcludedDate', () => {
      const actualFirstNonExcludedDate = addDaysWithFormat(dateNowFormatted(), 2);
      const repeatableTask = {
        ...savedRepeatableTasksMock[0],
        excludeDays: [addDaysWithFormat(dateNowFormatted(), 1)],
        repeatDaysInWeek: [0, 1, 2, 3, 4, 5, 6],
      } as RepeatableTask;
      const firstNonExcludedDate = findFirstNonExcludedDateFromTask(repeatableTask);

      expect(firstNonExcludedDate).toStrictEqual(actualFirstNonExcludedDate);
    });
  });
});
