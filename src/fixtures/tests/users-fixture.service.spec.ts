import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from '../../shared/repository/repository.service';
import { UsersFixtureService } from '../services/users-fixture.service';
import { storeIdMock } from '../../modules/tasks/tests/__mocks__/tasks.mocks';

describe('UsersFixtureService', () => {
  let service: UsersFixtureService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersFixtureService,
        {
          provide: Repository,
          useValue: {
            createMany: async () => jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersFixtureService>(UsersFixtureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should seed be called', async () => {
    jest.spyOn(service['repository'], 'createMany');
    const seedFn = jest.spyOn(service, 'seed');
    await service.seed({ id: storeIdMock, name: 'First Store', leafletLink: '', active: true });
    expect(seedFn).toBeCalled();
  });
});
