import { Test, TestingModule } from '@nestjs/testing';
import { SectionsFixtureService } from '../services/sections-fixture.service';
import { Repository } from '../../shared/repository/repository.service';
import { storeIdMock } from '../../modules/tasks/tests/__mocks__/tasks.mocks';

describe('SectionsFixtureService', () => {
  let service: SectionsFixtureService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionsFixtureService,
        {
          provide: Repository,
          useValue: {
            createMany: async () => jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SectionsFixtureService>(SectionsFixtureService);
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
