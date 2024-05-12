import { Test, TestingModule } from '@nestjs/testing';
import { NoticesScheduleService } from '../services/notices-schedule.service';
import { Repository } from '../../shared/repository/repository.service';
import { savedNoticesMock } from '../../modules/notices/tests/__mocks__/notices.mock';
import { NoticesHelperService } from '../../modules/notices/services/notices-helper.service';
import { storesMock } from '../../modules/stores/tests/__mocks__/stores.mock';

describe('NoticesScheduleService', () => {
  let service: NoticesScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticesScheduleService,
        {
          provide: Repository,
          useValue: {
            findAll: async () => jest.fn(),
            deleteCollection: async () => jest.fn(),
          },
        },
        {
          provide: NoticesHelperService,
          useValue: {
            clearAll: async () => jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NoticesScheduleService>(NoticesScheduleService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Clear Notices', () => {
    it('should delete all notices from yesterday', async () => {
      const clearNoticesFn = jest.spyOn(service, 'clearNotices');
      jest
        .spyOn(service['repository'], 'findAll')
        .mockResolvedValueOnce([...storesMock])
        .mockResolvedValueOnce([...savedNoticesMock]);

      await service.clearNotices();
      expect(clearNoticesFn).toBeCalled();
    });
  });
});
