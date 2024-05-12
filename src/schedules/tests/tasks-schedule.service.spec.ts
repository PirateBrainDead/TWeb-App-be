import { savedRepeatableTasksMock, savedTasksMock, storeIdMock } from '../../modules/tasks/tests/__mocks__/tasks.mocks';
import { Test, TestingModule } from '@nestjs/testing';
import { TasksScheduleService } from '../services/tasks-schedule.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DB_KEYS } from '../../shared/utils/db.utils';
import { addDaysWithFormat, formatDate } from '../../shared/utils/date.utils';
import { RepeatableTask, Task } from '../../modules/tasks/entity/task.entity';
import { Repository } from '../../shared/repository/repository.service';
import { TasksValidationService } from '../../modules/tasks/services/tasks-validation.service';
import { DeleteTaskService } from '../../modules/tasks/services/delete-task.service';
import { UpdateTaskService } from '../../modules/tasks/services/update-task.service';
import { TasksHelperService } from '../../modules/tasks/services/tasks-helper.service';
import { CellClsService } from '../../modules/libs/cls/cell-cls.service';
import { loggedInUserMock } from '../../modules/users/tests/__mocks__/users.mock';
import { StoresRepository } from '../../modules/stores/stores.repository';
import { storesMock } from '../../modules/stores/tests/__mocks__/stores.mock';
import { TasksService } from '../../modules/tasks/services/tasks.service';
import { NotificationsService } from '../../modules/notifications/notifications.service';

jest.mock('uuid', () => ({ v4: () => savedTasksMock[0].id }));

const dateNow = new Date();
const dateNowFormatted = formatDate(dateNow);
const repeatableTasksMock = [
  {
    ...savedRepeatableTasksMock[0],
    startDate: '2020-02-02',
    endDate: '2030-02-02',
    repeatDaysInWeek: [dateNow.getDay()],
  },
];
const createdNewTasksMock = [
  {
    ...savedTasksMock[0],
    repeatableTaskId: savedTasksMock[0].id,
    endDate: repeatableTasksMock[0].endDate,
    repeatDaysInWeek: repeatableTasksMock[0].repeatDaysInWeek,
  },
];
const todayTasksMock = [
  {
    id: '8e9f8954-0928-43b4-bd14-c095216ea52e',
    prioritize: true,
    name: 'First task',
    description: 'First task',
    date: '2024-03-05',
    startTime: '18:40',
    estimatedTime: '00:15',
    sectionId: '1ebc7a2f-2ff8-4c3c-9832-5303918dd16a',
    status: 0,
    repeatableTaskId: '8e9f8954-0928-43b4-bd14-c095216ea52e',
    endDate: addDaysWithFormat(new Date(), 3),
    repeatDaysInWeek: [0, 1],
  },
] as Task[];

describe('TasksScheduleService', () => {
  let service: TasksScheduleService;
  let repository: Repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksScheduleService,
        DeleteTaskService,
        UpdateTaskService,
        TasksValidationService,
        EventEmitter2,
        TasksService,
        {
          provide: Repository,
          useValue: {
            findAll: async () => jest.fn(),
            upsert: async () => jest.fn(),
          },
        },
        {
          provide: StoresRepository,
          useValue: {
            findAll: async () => jest.fn(),
          },
        },
        {
          provide: TasksHelperService,
          useValue: {
            saveDailyTasks: async () => jest.fn(),
          },
        },
        {
          provide: CellClsService,
          useValue: {
            storeId: loggedInUserMock.storeId,
            userId: loggedInUserMock.userId,
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            sendNotificationsToHq: () => jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksScheduleService>(TasksScheduleService);
    repository = module.get<Repository>(Repository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('RepeatableTaskConversion', () => {
    it('should create new task for today', async () => {
      const handleRepeatableTaskConversionFn = jest.spyOn(service, 'handleRepeatableTaskConversion');
      jest.spyOn(service['storesRepository'], 'findAll').mockResolvedValue(storesMock);
      jest.spyOn(repository, 'findAll').mockResolvedValue(repeatableTasksMock);
      const saveTasksByStoreAndDateFn = jest.spyOn(service['tasksHelperService'], 'saveDailyTasks');

      await service.handleRepeatableTaskConversion();

      expect(handleRepeatableTaskConversionFn).toBeCalled();
      expect(saveTasksByStoreAndDateFn).toBeCalledWith(createdNewTasksMock, storeIdMock);
    });
    it('should remove repeatableTask', async () => {
      const repeatableTasks = [{ ...savedRepeatableTasksMock[0], endDate: '2022-02-02' }];

      const handleRepeatableTaskConversionFn = jest.spyOn(service, 'handleRepeatableTaskConversion');
      jest.spyOn(service['storesRepository'], 'findAll').mockResolvedValue(storesMock);
      jest.spyOn(repository, 'findAll').mockResolvedValue(repeatableTasks);
      const upsertFn = jest.spyOn(repository, 'upsert');

      await service.handleRepeatableTaskConversion();

      expect(handleRepeatableTaskConversionFn).toBeCalled();
      expect(upsertFn).toBeCalledWith(DB_KEYS.TASKS.REPEATS(storeIdMock), []);
    });
    it('should skip repeatableTask - excludeDays', async () => {
      const repeatableTasks = [
        {
          ...savedRepeatableTasksMock[0],
          endDate: addDaysWithFormat(dateNowFormatted, 5),
          excludeDays: dateNowFormatted,
        },
      ];

      jest.spyOn(service['storesRepository'], 'findAll').mockResolvedValue(storesMock);
      jest.spyOn(repository, 'findAll').mockResolvedValue(repeatableTasks);
      const saveTasksByStoreAndDateFn = jest.spyOn(service['tasksHelperService'], 'saveDailyTasks');
      const upsertFn = jest.spyOn(repository, 'upsert');

      await service.handleRepeatableTaskConversion();

      expect(saveTasksByStoreAndDateFn).toBeCalledWith([], storeIdMock);
      expect(upsertFn).toBeCalledWith(DB_KEYS.TASKS.REPEATS(storeIdMock), repeatableTasks);
    });
    it('should not create new task for today - bad startDate condition', async () => {
      const repeatableTasks = [{ ...repeatableTasksMock[0], startDate: '2025-02-02' }];
      await testSkippingOfTaskInCreation(repeatableTasks);
    });
    it('should not create new task for today - bad repeatDaysInWeek condition', async () => {
      const repeatableTasks = [{ ...repeatableTasksMock[0], repeatDaysInWeek: [dateNow.getDay() - 1] }];
      await testSkippingOfTaskInCreation(repeatableTasks);
    });
    it('Should send notification for priority task not initialized', async () => {
      const sendReminderForPriorityTasks = jest.spyOn(service, 'sendReminderForPriorityTasks');
      jest.spyOn(service['storesRepository'], 'findAll').mockResolvedValue(storesMock);
      jest.spyOn(service['tasksService'], 'findDailyByDate').mockResolvedValue(todayTasksMock);

      const sendNotificationsToHqFn = jest.spyOn(service['notificatiosService'], 'sendNotificationsToHq');
      await service.sendReminderForPriorityTasks();

      expect(sendReminderForPriorityTasks).toBeCalled();
      expect(sendNotificationsToHqFn).toBeCalled();
    });
  });
  const testSkippingOfTaskInCreation = async (repeatableTasks: RepeatableTask[]) => {
    const handleRepeatableTaskConversionFn = jest.spyOn(service, 'handleRepeatableTaskConversion');
    jest.spyOn(service['storesRepository'], 'findAll').mockResolvedValue(storesMock);
    jest.spyOn(repository, 'findAll').mockResolvedValue(repeatableTasks);
    const saveTasksByStoreAndDateFn = jest.spyOn(service['tasksHelperService'], 'saveDailyTasks');

    await service.handleRepeatableTaskConversion();

    expect(handleRepeatableTaskConversionFn).toBeCalled();
    expect(saveTasksByStoreAndDateFn).toBeCalledWith([], storeIdMock);
  };
});
