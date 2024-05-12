import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../services/tasks.service';
import { TasksController } from '../tasks.controller';
import { createTaskMockDto, updateTaskMockDto, updateTasStatusMockDto } from './__mocks__/tasks.mocks';
import { DeleteTaskDto } from '../dto/delete-task.dto';
import { dateNowFormatted } from '../../../shared/utils/date.utils';
import { v4 as uuidv4 } from 'uuid';

describe('TasksController', () => {
  let tasksController: TasksController;
  let tasksService: TasksService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            findDailyByDate: () => jest.fn(),
            findRepeatableByDate: () => jest.fn(),
            create: () => jest.fn(),
            update: () => jest.fn(),
            updateStatus: () => jest.fn(),
            delete: () => jest.fn(),
          },
        },
      ],
    }).compile();

    tasksController = app.get<TasksController>(TasksController);
    tasksService = app.get<TasksService>(TasksService);
  });
  it('should call findAll by StoreId and Date', async () => {
    const findAllFn = jest.spyOn(tasksService, 'findDailyByDate');
    await tasksController.findDailyByDate({ date: createTaskMockDto.startDate });
    expect(findAllFn).toBeCalled();
  });
  it('should call findAllRepeatable by StoreId', async () => {
    const findAllRepeatableFn = jest.spyOn(tasksService, 'findRepeatableByDate');
    await tasksController.findRepeatableByDate({ date: createTaskMockDto.startDate });
    expect(findAllRepeatableFn).toBeCalled();
  });
  it('should call createTask', async () => {
    const createFn = jest.spyOn(tasksService, 'create');
    await tasksController.create(createTaskMockDto);
    expect(createFn).toBeCalled();
  });
  it('should call updateTask', async () => {
    const updateFn = jest.spyOn(tasksService, 'update');
    await tasksController.update(updateTaskMockDto);
    expect(updateFn).toBeCalled();
  });
  it('should call updateTaskStatus', async () => {
    const updateStatusFn = jest.spyOn(tasksService, 'updateStatus');
    await tasksController.updateStatus(updateTasStatusMockDto);
    expect(updateStatusFn).toBeCalled();
  });
  it('should call deleteTask', async () => {
    const deleteTaskDto = { id: uuidv4(), date: dateNowFormatted(), allEvents: false } as DeleteTaskDto;
    jest.spyOn(tasksService, 'delete').mockResolvedValue(true);
    expect(await tasksController.delete(deleteTaskDto)).toBeTruthy();
  });
});
