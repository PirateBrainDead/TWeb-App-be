import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../services/tasks.service';
import {
  createTaskMockDto,
  savedRepeatableTasksMock,
  savedTasksMock,
  updateTaskMockDto,
  updateTasStatusMockDto,
} from './__mocks__/tasks.mocks';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { addDaysWithFormat, dateNowFormatted, subtractDaysWithFormat } from '../../../shared/utils/date.utils';
import { CreateTaskDto } from '../dto/create-task.dto';
import { Repository } from '../../../shared/repository/repository.service';
import { TasksValidationService } from '../services/tasks-validation.service';
import { DeleteTaskService } from '../services/delete-task.service';
import { DeleteTaskDto } from '../dto/delete-task.dto';
import { UpdateTaskService } from '../services/update-task.service';
import { TasksHelperService } from '../services/tasks-helper.service';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { loggedInUserMock } from '../../users/tests/__mocks__/users.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Errors } from '../../../shared/constants/errors.constants';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { Task, TaskStatus } from '../entity/task.entity';

jest.mock('uuid', () => ({ v4: () => savedTasksMock[0].id }));

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        TasksValidationService,
        EventEmitter2,
        {
          provide: Repository,
          useValue: {
            findAll: async () => jest.fn(),
            findMany: async () => jest.fn(),
            findOne: async () => jest.fn(),
            update: async () => jest.fn(),
          },
        },
        {
          provide: DeleteTaskService,
          useValue: {
            deleteTodayTask: async () => jest.fn(),
            deleteRepeatableTask: async () => jest.fn(),
          },
        },
        {
          provide: UpdateTaskService,
          useValue: {
            updateTodayTask: async () => jest.fn(),
            updateRepeatableTask: async () => jest.fn(),
          },
        },
        {
          provide: TasksHelperService,
          useValue: {
            saveDailyTasks: async () => jest.fn(),
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

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('FindAll', () => {
    it('should call and return findAll by StoreId and not date now', async () => {
      jest.spyOn(service['repository'], 'findAll').mockResolvedValue([...savedTasksMock]);

      const tasks = await service.findDailyByDate(subtractDaysWithFormat(createTaskMockDto.startDate, 1));
      expect(tasks).toEqual(savedTasksMock);
    });
    it('should call and return findAll by StoreId and Date now', async () => {
      jest
        .spyOn(service['repository'], 'findAll')
        .mockResolvedValueOnce([...savedTasksMock])
        .mockResolvedValueOnce([...savedRepeatableTasksMock]);

      const tasks = await service.findDailyByDate(createTaskMockDto.startDate);
      tasks.map((a) => (a.isRepeatable = true));
      const updatedDailyTasks = savedTasksMock.map((task) => {
        return { ...task, isRepeatable: true };
      });
      expect(tasks).toEqual(updatedDailyTasks);
    });
  });
  describe('FindAllRepeatable', () => {
    it('should call and return all Repeatable Task by StoreId', async () => {
      jest.spyOn(service['repository'], 'findAll').mockResolvedValue(savedRepeatableTasksMock);
      const findAllRepeatableFn = jest.spyOn(service, 'findRepeatableByDate');

      await service.findRepeatableByDate(createTaskMockDto.startDate);

      expect(findAllRepeatableFn).toBeCalledWith(createTaskMockDto.startDate);
    });
  });
  describe('CreateNewTask', () => {
    it('should create new daily and repeatable task', async () => {
      const saveDailyTasksFn = jest.spyOn(service['tasksHelperService'], 'saveDailyTasks');
      const saveRepeatableTasksFn = jest.spyOn(service['tasksHelperService'], 'saveRepeatableTasks');

      const isCreated = await service.create(createTaskMockDto);

      expect(saveDailyTasksFn).toBeCalled();
      expect(saveRepeatableTasksFn).toBeCalled();
      expect(isCreated).toBeTruthy();
    });
    it('should create new tasks for current day without repeatable tasks', async () => {
      const saveDailyTasksFn = jest.spyOn(service['tasksHelperService'], 'saveDailyTasks');

      const upsertTaskDto = {
        ...createTaskMockDto,
        startDate: dateNowFormatted(),
        repeatDaysInWeek: [],
      } as CreateTaskDto;
      const savedTasks: Task[] = [
        {
          ...savedTasksMock[0],
          repeatableTaskId: '',
          isRepeatable: false,
          repeatDaysInWeek: undefined,
          endDate: undefined,
        },
      ];

      const isCreated = await service.create(upsertTaskDto);

      expect(saveDailyTasksFn).toBeCalledWith(savedTasks);
      expect(isCreated).toBeTruthy();
    });
    it('should create new repeatable tasks', async () => {
      const saveRepeatableTasksFn = jest.spyOn(service['tasksHelperService'], 'saveRepeatableTasks');

      const startDate = '2023-03-04';
      const endDate = '2023-03-10';
      const upsertTaskDto = { ...createTaskMockDto, startDate, endDate } as CreateTaskDto;

      const isCreated = await service.create(upsertTaskDto);

      const savedRepeatableTask = { ...savedRepeatableTasksMock[0], startDate: '2023-03-05', endDate };

      expect(saveRepeatableTasksFn).toBeCalledWith(startDate, [savedRepeatableTask], false);
      expect(isCreated).toBeTruthy();
    });
  });
  describe('UpdateTask', () => {
    it('should update daily task', async () => {
      const updateTodayTaskFn = jest.spyOn(service['updateTaskService'], 'updateTodayTask');
      const isUpdated = await service.update(updateTaskMockDto);
      expect(updateTodayTaskFn).toBeCalled();
      expect(isUpdated).toBeTruthy();
    });
    it('should update repeatable task', async () => {
      const updateRepeatableTaskFn = jest.spyOn(service['updateTaskService'], 'updateRepeatableTask');

      const taskDto = { ...updateTaskMockDto, date: addDaysWithFormat(dateNowFormatted(), 1) };

      const isUpdated = await service.update(taskDto);
      expect(updateRepeatableTaskFn).toBeCalled();
      expect(isUpdated).toBeTruthy();
    });
  });
  describe('Update task status', () => {
    it('should update task status', async () => {
      jest
        .spyOn(service['repository'], 'findOne')
        .mockResolvedValue({ ...savedTasksMock[0], status: TaskStatus.INITIATED } as Task);
      const isUpdated = await service.updateStatus(updateTasStatusMockDto);
      expect(isUpdated).toBeTruthy();
    });
    it('should throw NotFoundException with not-existing id', async () => {
      jest.spyOn(service['repository'], 'findOne').mockResolvedValue({ ...savedTasksMock[0] });
      const updateTaskStatusDto = { id: 'id', status: TaskStatus.INITIATED } as UpdateTaskStatusDto;
      try {
        await service.updateStatus(updateTaskStatusDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.response.message).toEqual(Errors.TaskNotFound);
      }
    });
    it('should throw BadRequestException for update task status', async () => {
      jest.spyOn(service['repository'], 'findOne').mockResolvedValue({ ...savedTasksMock[0] });
      const updateTaskStatusDto = { ...updateTasStatusMockDto, status: TaskStatus.DONE } as UpdateTaskStatusDto;
      try {
        await service.updateStatus(updateTaskStatusDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toEqual(Errors.TaskMustBeInInitiatedStatus);
      }
    });
  });
  describe('DeleteTask', () => {
    it('should delete daily task', async () => {
      const deleteTodayTaskFn = jest.spyOn(service['deleteTaskService'], 'deleteTodayTask').mockResolvedValue();
      const deleteTaskDto = {
        id: savedTasksMock[0].id,
        date: dateNowFormatted(),
        allEvents: false,
      } as DeleteTaskDto;
      const isDeleted = await service.delete(deleteTaskDto);
      expect(deleteTodayTaskFn).toBeCalled();
      expect(isDeleted).toBeTruthy();
    });
    it('should delete repeatable task', async () => {
      const deleteRepeatableTaskFn = jest
        .spyOn(service['deleteTaskService'], 'deleteRepeatableTask')
        .mockResolvedValue();
      const deleteTaskDto = {
        id: savedTasksMock[0].id,
        date: addDaysWithFormat(new Date(), 3),
        allEvents: false,
      } as DeleteTaskDto;
      const isDeleted = await service.delete(deleteTaskDto);
      expect(deleteRepeatableTaskFn).toBeCalled();
      expect(isDeleted).toBeTruthy();
    });
  });
});
