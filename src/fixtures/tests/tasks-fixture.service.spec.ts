import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from '../../shared/repository/repository.service';
import { TasksFixtureService } from '../services/tasks-fixture.service';
import { savedRepeatableTasksMock, storeIdMock } from '../../modules/tasks/tests/__mocks__/tasks.mocks';

describe('TasksFixtureService', () => {
  let service: TasksFixtureService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksFixtureService,
        {
          provide: Repository,
          useValue: {
            createMany: async () => jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksFixtureService>(TasksFixtureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should seed daily be called', async () => {
    jest.spyOn(service['repository'], 'createMany');
    const seedFn = jest.spyOn(service, 'seedDaily');
    await service.seedDaily(
      { id: storeIdMock, name: 'First Store', leafletLink: '', active: true },
      [].concat(...new Array(100).fill(savedRepeatableTasksMock)),
    );
    expect(seedFn).toBeCalled();
  });

  it('should seed repeatable be called', async () => {
    jest.spyOn(service['repository'], 'createMany');
    const seedFn = jest.spyOn(service, 'seedRepeatable');
    await service.seedRepeatable({ id: storeIdMock, name: 'First Store', leafletLink: '', active: true }, [
      { id: storeIdMock, name: 'test', iconName: 'test', plannedDays: [] },
    ]);
    expect(seedFn).toBeCalled();
  });
});
