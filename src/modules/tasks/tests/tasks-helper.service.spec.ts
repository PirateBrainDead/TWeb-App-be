import { Test, TestingModule } from '@nestjs/testing';
import { savedRepeatableTasksMock, savedTasksMock, storeIdMock } from './__mocks__/tasks.mocks';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from '../../../shared/repository/repository.service';
import { TasksValidationService } from '../services/tasks-validation.service';
import { TasksHelperService } from '../services/tasks-helper.service';
import { NotFoundException } from '@nestjs/common';
import { DB_KEYS } from '../../../shared/utils/db.utils';
import { Errors } from '../../../shared/constants/errors.constants';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { loggedInUserMock } from '../../users/tests/__mocks__/users.mock';
import { dateNowFormatted } from '../../../shared/utils/date.utils';

describe('TasksHelperService', () => {
  let service: TasksHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksHelperService,
        TasksValidationService,
        EventEmitter2,
        {
          provide: Repository,
          useValue: {
            findOne: async () => jest.fn(),
            create: async () => jest.fn(),
            createMany: async () => jest.fn(),
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

    service = module.get<TasksHelperService>(TasksHelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('SaveDailyTasks', () => {
    it('should save tasks daily tasks by store and date', async () => {
      const saveTasksByStoreAndDateFn = jest.spyOn(service, 'saveDailyTasks');
      jest.spyOn(service['repository'], 'findOne').mockResolvedValue({ ...savedTasksMock[0] });

      await service.saveDailyTasks(savedTasksMock);

      expect(saveTasksByStoreAndDateFn).toBeCalled();
    });
    it('should save tasks daily tasks by store and date - with provided storeId', async () => {
      const saveTasksByStoreAndDateFn = jest.spyOn(service, 'saveDailyTasks');
      jest.spyOn(service['repository'], 'findOne').mockResolvedValue({ ...savedTasksMock[0] });

      await service.saveDailyTasks(savedTasksMock, storeIdMock);

      expect(saveTasksByStoreAndDateFn).toBeCalled();
    });
    it('should break from function', async () => {
      const saveTasksByStoreAndDateFn = jest.spyOn(service, 'saveDailyTasks');
      const findOneFn = jest.spyOn(service['repository'], 'findOne').mockResolvedValue({ ...savedTasksMock[0] });

      await service.saveDailyTasks([]);
      expect(saveTasksByStoreAndDateFn).toBeCalled();
      expect(findOneFn).not.toBeCalled();
    });
  });
  describe('SaveRepeatableTasks', () => {
    it('should save repeatable tasks for store', async () => {
      const saveRepeatableTasksFn = jest.spyOn(service, 'saveRepeatableTasks');
      const createManyFn = jest.spyOn(service['repository'], 'createMany');

      await service.saveRepeatableTasks(dateNowFormatted(), savedRepeatableTasksMock, true);

      expect(saveRepeatableTasksFn).toBeCalled();
      expect(createManyFn).toBeCalledWith(DB_KEYS.TASKS.REPEATS(storeIdMock), savedRepeatableTasksMock);
    });
  });
  describe('GetRepeatableTasks', () => {
    it('should get repeatable task', async () => {
      jest.spyOn(service['repository'], 'findOne').mockResolvedValue({ ...savedRepeatableTasksMock[0] });
      const getRepeatableTaskFn = jest.spyOn(service, 'getRepeatableTask');

      await service.getRepeatableTask(savedTasksMock[0].id);

      expect(getRepeatableTaskFn).toBeCalled();
    });
    it('should throw NotFoundException in get repeatable task', async () => {
      jest.spyOn(service['repository'], 'findOne').mockResolvedValue(undefined);

      try {
        await service.getRepeatableTask(savedTasksMock[0].id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.response.message).toEqual(Errors.TaskNotFound);
      }
    });
  });
});
