import { Test, TestingModule } from '@nestjs/testing';
import { savedRepeatableTasksMock, savedTasksMock, storeIdMock } from './__mocks__/tasks.mocks';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from '../../../shared/repository/repository.service';
import { TasksValidationService } from '../services/tasks-validation.service';
import { DeleteTaskService } from '../services/delete-task.service';
import { addDaysWithFormat, dateNowFormatted, subtractDaysWithFormat } from '../../../shared/utils/date.utils';
import { DeleteTaskDto } from '../dto/delete-task.dto';
import { DB_KEYS } from '../../../shared/utils/db.utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '../entity/task.entity';
import { TasksHelperService } from '../services/tasks-helper.service';
import { Errors } from '../../../shared/constants/errors.constants';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { loggedInUserMock } from '../../users/tests/__mocks__/users.mock';

describe('DeleteTaskService', () => {
  let service: DeleteTaskService;
  const currentDate = dateNowFormatted();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteTaskService,
        TasksValidationService,
        EventEmitter2,
        {
          provide: Repository,
          useValue: {
            findAll: async () => jest.fn(),
            findOne: async () => jest.fn(),
            create: async () => jest.fn(),
            update: async () => jest.fn(),
            delete: async () => jest.fn(),
          },
        },
        {
          provide: TasksHelperService,
          useValue: {
            getRepeatableTask: async () => jest.fn(),
          },
        },
        {
          provide: CellClsService,
          useValue: {
            storeId: loggedInUserMock.storeId,
            userId: loggedInUserMock.userId,
          },
        },
      ],
    }).compile();

    service = module.get<DeleteTaskService>(DeleteTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('Delete today task', () => {
    it('should delete only today task', async () => {
      const task = { ...savedTasksMock[0] };
      jest.spyOn(service['repository'], 'findOne').mockResolvedValue(task);
      const upsertFn = jest.spyOn(service['repository'], 'delete');
      const deleteTaskDto = {
        id: task.id,
        date: currentDate,
        allEvents: false,
      } as DeleteTaskDto;

      await service.deleteTodayTask(deleteTaskDto);
      const dbKey = DB_KEYS.TASKS.DAILY(storeIdMock, currentDate);

      expect(upsertFn).toBeCalledWith(dbKey, task.id);
    });
    it('should throw NotFoundException with not-existing id', async () => {
      jest.spyOn(service['repository'], 'findOne').mockResolvedValue({ ...savedTasksMock[0] });
      const deleteTaskDto = {
        id: 'id',
        date: currentDate,
        allEvents: false,
      } as DeleteTaskDto;
      try {
        await service.deleteTodayTask(deleteTaskDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.response.message).toEqual(Errors.TaskNotFound);
      }
    });
    it('should throw BadRequestException with bad status of task', async () => {
      const savedTask = { ...savedTasksMock[0], status: TaskStatus.DONE };
      jest.spyOn(service['repository'], 'findOne').mockResolvedValue(savedTask);
      const deleteTaskDto = {
        id: savedTask.id,
        date: currentDate,
        allEvents: false,
      } as DeleteTaskDto;
      try {
        await service.deleteTodayTask(deleteTaskDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toEqual(Errors.TaskInProvidedStatusCantBeDeleted);
      }
    });
    it('should delete today task and his repeatable tasks', async () => {
      jest.spyOn(service['repository'], 'findAll').mockResolvedValue([...savedTasksMock]);
      jest.spyOn(service['repository'], 'findOne').mockResolvedValue({ ...savedTasksMock[0] });
      jest
        .spyOn(service['tasksHelperService'], 'getRepeatableTask')
        .mockResolvedValue({ ...savedRepeatableTasksMock[0] });
      const deleteRepeatableTaskInstanceFn = jest.spyOn(service as any, 'deleteRepeatableTaskInstance');
      const deleteTaskDto = {
        id: savedTasksMock[0].id,
        date: currentDate,
        allEvents: true,
      } as DeleteTaskDto;

      await service.deleteTodayTask(deleteTaskDto);

      expect(deleteRepeatableTaskInstanceFn).toBeCalled();
    });
  });
  describe('Delete repeatable task', () => {
    describe('DeleteRepeatableTask', () => {
      it('should call delete deleteRepeatableTaskInstance', async () => {
        jest.spyOn(service['repository'], 'findAll').mockResolvedValue([...savedTasksMock]);
        const repeatableTask = { ...savedRepeatableTasksMock[0], repeatDaysInWeek: [] };
        jest.spyOn(service['tasksHelperService'], 'getRepeatableTask').mockResolvedValue(repeatableTask);
        jest.spyOn(service, 'deleteRepeatableTask');
        const deleteRepeatableTaskInstanceFn = jest.spyOn(service as any, 'deleteRepeatableTaskInstance');

        await service.deleteRepeatableTask({
          id: savedTasksMock[0].id,
          date: currentDate,
          allEvents: true,
        });

        expect(deleteRepeatableTaskInstanceFn).toBeCalled();
      });
      it('should call deleteRepeatableTaskFromStart', async () => {
        jest.spyOn(service['repository'], 'findAll').mockResolvedValue([...savedTasksMock]);
        jest
          .spyOn(service['tasksHelperService'], 'getRepeatableTask')
          .mockResolvedValue({ ...savedRepeatableTasksMock[0] });
        jest.spyOn(service, 'deleteRepeatableTask');
        const deleteRepeatableTaskFromStartFn = jest.spyOn(service as any, 'deleteRepeatableTaskFromStart');

        await service.deleteRepeatableTask({
          id: savedTasksMock[0].id,
          date: savedTasksMock[0].date,
          allEvents: true,
        });

        expect(deleteRepeatableTaskFromStartFn).toBeCalled();
      });
      it('should call deleteRepeatableTaskFromEnd', async () => {
        jest
          .spyOn(service['tasksHelperService'], 'getRepeatableTask')
          .mockResolvedValue({ ...savedRepeatableTasksMock[0] });
        jest.spyOn(service, 'deleteRepeatableTask');
        const deleteRepeatableTaskFromEndFn = jest.spyOn(service as any, 'deleteRepeatableTaskFromEnd');

        await service.deleteRepeatableTask({
          id: savedRepeatableTasksMock[0].id,
          date: savedRepeatableTasksMock[0].endDate,
          allEvents: true,
        });

        expect(deleteRepeatableTaskFromEndFn).toBeCalled();
      });
      it('should call deleteRepeatableTaskFromMiddle', async () => {
        jest
          .spyOn(service['tasksHelperService'], 'getRepeatableTask')
          .mockResolvedValue({ ...savedRepeatableTasksMock[0] });
        jest.spyOn(service, 'deleteRepeatableTask');
        const deleteRepeatableTaskFromMiddleFn = jest.spyOn(service as any, 'deleteRepeatableTaskFromMiddle');

        await service.deleteRepeatableTask({
          id: savedRepeatableTasksMock[0].id,
          date: addDaysWithFormat(savedRepeatableTasksMock[0].startDate, 1),
          allEvents: true,
        });

        expect(deleteRepeatableTaskFromMiddleFn).toBeCalled();
      });
    });
    describe('DeleteRepeatableTaskFromStart', () => {
      it('should call deleteRepeatableTaskInstance - allEvents', async () => {
        jest.spyOn(service['repository'], 'findAll').mockResolvedValue([...savedTasksMock]);
        const deleteRepeatableTaskInstanceFn = jest.spyOn(service as any, 'deleteRepeatableTaskInstance');
        const taskDto = {
          id: savedTasksMock[0].id,
          date: savedTasksMock[0].date,
          allEvents: true,
        };

        await (service as any).deleteRepeatableTaskFromStart(taskDto, {
          ...savedRepeatableTasksMock[0],
        });

        expect(deleteRepeatableTaskInstanceFn).toBeCalled();
      });
      it('should deleteRepeatableTaskFromStart - only this event', async () => {
        jest
          .spyOn(service['tasksHelperService'], 'getRepeatableTask')
          .mockResolvedValue({ ...savedRepeatableTasksMock[0] });
        const updateFn = jest.spyOn(service['repository'], 'update');
        jest.spyOn(service, 'deleteRepeatableTask');
        const taskDto = {
          id: savedTasksMock[0].id,
          date: savedTasksMock[0].date,
          allEvents: false,
        };

        const savedRepeatableTask = { ...savedRepeatableTasksMock[0] };
        await (service as any).deleteRepeatableTaskFromStart(taskDto, savedRepeatableTask);

        savedRepeatableTask.startDate = addDaysWithFormat(savedRepeatableTask.startDate, 1);

        expect(updateFn).toBeCalledWith(DB_KEYS.TASKS.REPEATS(storeIdMock), savedRepeatableTask);
      });
    });
    describe('DeleteRepeatableTaskFromMiddle', () => {
      it('should delete deleteRepeatableTaskFromMiddle - allEvents', async () => {
        const updateFn = jest.spyOn(service['repository'], 'update');

        const date = addDaysWithFormat(savedTasksMock[0].date, 1);
        const taskDto = {
          id: savedTasksMock[0].id,
          date: date,
          allEvents: true,
        };
        const savedRepeatableTask = { ...savedRepeatableTasksMock[0] };

        await (service as any).deleteRepeatableTaskFromMiddle(taskDto, savedRepeatableTask);

        savedRepeatableTask.endDate = subtractDaysWithFormat(date, 1);

        expect(updateFn).toBeCalledWith(DB_KEYS.TASKS.REPEATS(storeIdMock), savedRepeatableTask);
      });
      it('should delete deleteRepeatableTaskFromMiddle - single event with existing excludeDays', async () => {
        const updateFn = jest.spyOn(service['repository'], 'update');

        const date = addDaysWithFormat(savedTasksMock[0].date, 1);
        const taskDto = {
          id: savedTasksMock[0].id,
          date: date,
          allEvents: false,
        };
        const savedRepeatableTask = { ...savedRepeatableTasksMock[0], excludeDays: [date] };
        await (service as any).deleteRepeatableTaskFromMiddle(taskDto, savedRepeatableTask);

        expect(updateFn).toBeCalled();
      });
      it('should delete deleteRepeatableTaskFromMiddle - single event with non-existing excludeDays', async () => {
        const updateFn = jest.spyOn(service['repository'], 'update');

        const date = addDaysWithFormat(savedTasksMock[0].date, 1);
        const taskDto = {
          id: savedTasksMock[0].id,
          date: date,
          allEvents: false,
        };
        const savedRepeatableTask = { ...savedRepeatableTasksMock[0] };
        await (service as any).deleteRepeatableTaskFromMiddle(taskDto, savedRepeatableTask);

        expect(updateFn).toBeCalled();
      });
    });
  });
});
