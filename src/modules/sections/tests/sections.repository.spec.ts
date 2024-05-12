import { Test, TestingModule } from '@nestjs/testing';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { loggedInUserMock } from '../../users/tests/__mocks__/users.mock';
import { Repository } from '../../../shared/repository/repository.service';
import { SectionsRepository } from '../sections.repository';
import { createSectionMock, savedSectionsMock } from './__mocks__/sections.mocks';

describe('SectionsRepository', () => {
  let service: SectionsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionsRepository,
        {
          provide: Repository,
          useValue: {
            findAll: async () => jest.fn(),
            findOne: async () => jest.fn(),
            create: async () => jest.fn(),
            update: async () => jest.fn(),
          },
        },
        {
          provide: CellClsService,
          useValue: {
            storeId: loggedInUserMock.storeId,
          },
        },
      ],
    }).compile();

    service = module.get<SectionsRepository>(SectionsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should findAll', async () => {
    const findAllFn = jest.spyOn(service['repository'], 'findAll').mockResolvedValue(savedSectionsMock);

    const sections = await service.findAll();

    expect(findAllFn).toBeCalled();
    expect(sections).toEqual(savedSectionsMock);
  });
  it('should findById', async () => {
    const findByIdFn = jest.spyOn(service['repository'], 'findOne').mockResolvedValue(savedSectionsMock[0]);

    const section = await service.findById(savedSectionsMock[0].id);

    expect(findByIdFn).toBeCalled();
    expect(section).toEqual(savedSectionsMock[0]);
  });
  it('should create new section', async () => {
    const createFn = jest.spyOn(service, 'create');

    const isSuccess = await service.create(createSectionMock);

    expect(createFn).toBeCalled();
    expect(isSuccess).toBeTruthy();
  });
  it('should update section', async () => {
    const updateFn = jest.spyOn(service, 'update');

    await service.update(savedSectionsMock[0]);

    expect(updateFn).toBeCalled();
  });
});
