import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../../modules/libs/redis/redis.service';
import { FixturesService } from '../fixtures.service';
import { StoresFixtureService } from '../services/stores-fixture.service';
import { Repository } from '../../shared/repository/repository.service';
import { UsersFixtureService } from '../services/users-fixture.service';
import { TasksFixtureService } from '../services/tasks-fixture.service';
import { SectionsFixtureService } from '../services/sections-fixture.service';
import { StaffFixtureService } from '../services/staff-fixture.service';

describe('FixturesService', () => {
  let service: FixturesService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FixturesService,
        StoresFixtureService,
        UsersFixtureService,
        TasksFixtureService,
        SectionsFixtureService,
        StaffFixtureService,
        Repository,
        {
          provide: RedisService,
          useValue: {
            reset: async () => jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FixturesService>(FixturesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should resetDatabase be called', async () => {
    const resetFn = jest.spyOn(service['db'], 'reset');
    await service.resetDatabase();
    expect(resetFn).toBeCalled();
  });
});
