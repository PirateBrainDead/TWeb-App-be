import { Test, TestingModule } from '@nestjs/testing';
import { subtractDaysWithFormat } from '../../shared/utils/date.utils';
import { Repository } from '../../shared/repository/repository.service';
import { StatisticsScheduleService } from '../services/statistics-schedule.service';
import { StatisticsRepository } from '../../modules/statistics/statistics.repository';
import {
  generatedStatisticsForYesterdayMock,
  savedTasksForStatisticsMock,
} from '../../modules/statistics/__mocks__/statistics.mock';
import { storesMock } from '../../modules/stores/tests/__mocks__/stores.mock';

describe('StatisticsScheduleService', () => {
  let service: StatisticsScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsScheduleService,
        {
          provide: Repository,
          useValue: {
            findAll: async () => jest.fn(),
          },
        },
        {
          provide: StatisticsRepository,
          useValue: {
            create: async () => jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StatisticsScheduleService>(StatisticsScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('CreateDailyStatistics', () => {
    it('should create new statistics for yesterday', async () => {
      const createDailyStatisticsFn = jest.spyOn(service, 'createDailyStatistics');
      const createFn = jest.spyOn(service['statisticsRepository'], 'create');
      jest
        .spyOn(service['repository'], 'findAll')
        .mockResolvedValueOnce([...storesMock])
        .mockResolvedValueOnce([...savedTasksForStatisticsMock]);

      const yesterday = subtractDaysWithFormat(new Date(), 1);
      await service.createDailyStatistics();

      expect(createDailyStatisticsFn).toBeCalled();
      expect(createFn).toBeCalledWith(storesMock[0].id, yesterday, generatedStatisticsForYesterdayMock);
    });
  });
});
