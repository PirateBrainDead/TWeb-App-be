import { Test, TestingModule } from '@nestjs/testing';
import { StoresFixtureService } from '../services/stores-fixture.service';
import { Repository } from '../../shared/repository/repository.service';

describe('StoresFixtureService', () => {
  let service: StoresFixtureService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresFixtureService,
        {
          provide: Repository,
          useValue: {
            createMany: async () => jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StoresFixtureService>(StoresFixtureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should seed be called', async () => {
    jest.spyOn(service['repository'], 'createMany');
    const seedFn = jest.spyOn(service, 'seed');
    await service.seed();
    expect(seedFn).toBeCalled();
  });
});
