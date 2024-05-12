import { Test, TestingModule } from '@nestjs/testing';
import { savedRepeatableTasksMock, savedTasksMock, updateTaskMockDto } from './__mocks__/tasks.mocks';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from '../../../shared/repository/repository.service';
import { TasksValidationService } from '../services/tasks-validation.service';
import { addDaysWithFormat, subtractDaysWithFormat } from '../../../shared/utils/date.utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RepeatableTask, Task, TaskStatus } from '../entity/task.entity';
import { TasksHelperService } from '../services/tasks-helper.service';
import { UpdateTaskService } from '../services/update-task.service';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Errors } from '../../../shared/constants/errors.constants';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { loggedInUserMock } from '../../users/tests/__mocks__/users.mock';

describe('UpdateTaskService', () => {
  let service: UpdateTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTaskService,
        TasksValidationService,
        EventEmitter2,
        {
          provide: Repository,
          useValue: {
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
            saveRepeatableTasks: async () => jest.fn(),
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

    service = module.get<UpdateTaskService>(UpdateTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('Update today task', () => {
    describe('Update today task', () => {
      it('should update only today task', async () => {
        const task = { ...savedTasksMock[0], repeatableTaskId: '' } as Task;
        jest.spyOn(service['repository'], 'findOne').mockResolvedValue(task);
        const updateSingleDailyTaskFn = jest.spyOn(service as any, 'updateSingleDailyTask');
        const updateTodayRepeatableTaskFn = jest.spyOn(service as any, 'updateTodayRepeatableTask');
        const saveRepeatableTasksFn = jest.spyOn(service['tasksHelperService'], 'saveRepeatableTasks');

        const updateDto = { ...updateTaskMockDto, repeatDaysInWeek: [] } as UpdateTaskDto;
        await service.updateTodayTask(updateDto);

        expect(updateTodayRepeatableTaskFn).not.toBeCalled();
        expect(saveRepeatableTasksFn).not.toBeCalled();
        expect(updateSingleDailyTaskFn).toBeCalled();
      });
      it('should update today and repeatable task', async () => {
        const task = { ...savedTasksMock[0] } as Task;
        jest.spyOn(service['repository'], 'findOne').mockResolvedValue(task);
        const updateSingleDailyTaskFn = jest.spyOn(service as any, 'updateSingleDailyTask');
        const updateTodayRepeatableTaskFn = jest.spyOn(service as any, 'updateTodayRepeatableTask');
        const saveRepeatableTasksFn = jest.spyOn(service['tasksHelperService'], 'saveRepeatableTasks');

        const updateDto = { ...updateTaskMockDto, repeatDaysInWeek: [] } as UpdateTaskDto;
        await service.updateTodayTask(updateDto);

        expect(updateTodayRepeatableTaskFn).toBeCalled();
        expect(saveRepeatableTasksFn).not.toBeCalled();
        expect(updateSingleDailyTaskFn).toBeCalled();
      });
      it('should update today task and create new repeatable task', async () => {
        const task = { ...savedTasksMock[0], repeatableTaskId: '' } as Task;
        jest.spyOn(service['repository'], 'findOne').mockResolvedValue(task);
        const updateSingleDailyTaskFn = jest.spyOn(service as any, 'updateSingleDailyTask');
        const updateTodayRepeatableTaskFn = jest.spyOn(service as any, 'updateTodayRepeatableTask');
        const saveRepeatableTasksFn = jest.spyOn(service['tasksHelperService'], 'saveRepeatableTasks');

        const updateDto = { ...updateTaskMockDto } as UpdateTaskDto;
        await service.updateTodayTask(updateDto);

        expect(updateTodayRepeatableTaskFn).not.toBeCalled();
        expect(saveRepeatableTasksFn).toBeCalled();
        expect(updateSingleDailyTaskFn).toBeCalled();
      });
      it('should throw NotFoundException with not-existing id', async () => {
        jest.spyOn(service['repository'], 'findOne').mockResolvedValue(undefined);
        const updateDto = { ...updateTaskMockDto, id: 'id' } as UpdateTaskDto;
        try {
          await service.updateTodayTask(updateDto);
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.response.message).toEqual(Errors.TaskNotFound);
        }
      });
      it('should throw BadRequestException with bad status of task', async () => {
        const savedTask = { ...savedTasksMock[0], status: TaskStatus.DONE };
        jest.spyOn(service['repository'], 'findOne').mockResolvedValue(savedTask);
        try {
          await service.updateTodayTask(updateTaskMockDto);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.response.message).toEqual(Errors.TaskInProvidedStatusCantBeDeleted);
        }
      });
    });
    describe('UpdateTodayRepeatableTask', () => {
      it('should delete repeatable task', async () => {
        const deleteFn = jest.spyOn(service['repository'], 'delete');

        const updateDto = { ...updateTaskMockDto, repeatDaysInWeek: [] } as UpdateTaskDto;

        await (service as any).updateTodayRepeatableTask({ ...savedTasksMock[0] }, updateDto);

        expect(deleteFn).toBeCalled();
      });
      it('should update repeatable task', async () => {
        const updateFn = jest.spyOn(service['repository'], 'update');
        const deleteFn = jest.spyOn(service['repository'], 'delete');

        const updateDto = { ...updateTaskMockDto, allEvents: true } as UpdateTaskDto;

        await (service as any).updateTodayRepeatableTask({ ...savedTasksMock[0] }, updateDto);

        expect(deleteFn).not.toBeCalled();
        expect(updateFn).toBeCalled();
      });
    });
    describe('Update repeatable task', () => {
      describe('Update repeatable task', () => {
        it('should call updateRepeatableTaskFromStart', async () => {
          jest
            .spyOn(service['tasksHelperService'], 'getRepeatableTask')
            .mockResolvedValue({ ...savedRepeatableTasksMock[0] });
          const updateRepeatableTaskFromStartFn = jest.spyOn(service as any, 'updateRepeatableTaskFromStart');

          await service.updateRepeatableTask(updateTaskMockDto);

          expect(updateRepeatableTaskFromStartFn).toBeCalled();
        });
        it('should call updateRepeatableTaskFromEnd', async () => {
          const repeatableSavedTask = { ...savedRepeatableTasksMock[0] };
          jest.spyOn(service['tasksHelperService'], 'getRepeatableTask').mockResolvedValue(repeatableSavedTask);
          const updateRepeatableTaskFromEndFn = jest.spyOn(service as any, 'updateRepeatableTaskFromEnd');

          const updateDto = { ...updateTaskMockDto, date: repeatableSavedTask.endDate };
          await service.updateRepeatableTask(updateDto);

          expect(updateRepeatableTaskFromEndFn).toBeCalled();
        });
        it('should call updateRepeatableTaskFromMiddle', async () => {
          const repeatableSavedTask = { ...savedRepeatableTasksMock[0] };
          jest.spyOn(service['tasksHelperService'], 'getRepeatableTask').mockResolvedValue(repeatableSavedTask);
          const updateRepeatableTaskFromMiddleFn = jest.spyOn(service as any, 'updateRepeatableTaskFromMiddle');

          const updateDto = { ...updateTaskMockDto, date: addDaysWithFormat(repeatableSavedTask.startDate, 1) };
          await service.updateRepeatableTask(updateDto);

          expect(updateRepeatableTaskFromMiddleFn).toBeCalled();
        });
      });
      describe('Update repeatable task from start', () => {
        it('should update repeatable task from start - allEvents', async () => {
          const updateFn = jest.spyOn(service['repository'], 'update');
          const createFn = jest.spyOn(service['repository'], 'create');

          const updateDto = { ...updateTaskMockDto, allEvents: true } as UpdateTaskDto;

          await (service as any).updateRepeatableTaskFromStart(updateDto, {
            ...savedRepeatableTasksMock[0],
          });

          expect(createFn).not.toBeCalled();
          expect(updateFn).toBeCalled();
        });
      });
      describe('Update repeatable task from middle', () => {
        it('should update repeatable task from middle - allEvents', async () => {
          const updateFn = jest.spyOn(service['repository'], 'update');
          const createFn = jest.spyOn(service['repository'], 'create');

          const updateDto = { ...updateTaskMockDto, allEvents: true } as UpdateTaskDto;
          const newEndDate = subtractDaysWithFormat(updateDto.date, 1);

          const savedRepeatableTask = { ...savedRepeatableTasksMock[0] };
          await (service as any).updateRepeatableTaskFromMiddle(updateDto, savedRepeatableTask);

          expect(savedRepeatableTask.endDate).toEqual(newEndDate);
          expect(updateFn).toBeCalled();
          expect(createFn).toBeCalled();
        });
        it('should update repeatable task from middle - only single event', async () => {
          const updateFn = jest.spyOn(service['repository'], 'update');
          const createFn = jest.spyOn(service['repository'], 'create');

          const updateDto = { ...updateTaskMockDto } as UpdateTaskDto;

          const savedRepeatableTask = { ...savedRepeatableTasksMock[0] };
          await (service as any).updateRepeatableTaskFromMiddle(updateDto, savedRepeatableTask);

          expect(savedRepeatableTask.excludeDays).toEqual([updateDto.date]);
          expect(updateFn).toBeCalled();
          expect(createFn).toBeCalled();
        });
        it('should update repeatable task from middle - only single event 1', async () => {
          const updateFn = jest.spyOn(service['repository'], 'update');
          const createFn = jest.spyOn(service['repository'], 'create');

          const updateDto = { ...updateTaskMockDto } as UpdateTaskDto;

          const savedRepeatableTask = { ...savedRepeatableTasksMock[0], excludeDays: ['2023-02-03'] } as RepeatableTask;
          const newExcludeDays = [...savedRepeatableTask.excludeDays, updateDto.date];

          await (service as any).updateRepeatableTaskFromMiddle(updateDto, savedRepeatableTask);

          expect(savedRepeatableTask.excludeDays).toEqual(newExcludeDays);
          expect(updateFn).toBeCalled();
          expect(createFn).toBeCalled();
        });
      });
    });
  });
});
