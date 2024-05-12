import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from '../../../shared/repository/repository.service';
import { StoresRepository } from '../stores.repository';

import { savedStoreMock, storesMock } from './__mocks__/stores.mock';

describe('StoresRepository', () => {
  let service: StoresRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresRepository,
        {
          provide: Repository,
          useValue: {
            findAll: async () => jest.fn(),
            findOne: async () => jest.fn(),
            create: async () => jest.fn(),
            update: async () => jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StoresRepository>(StoresRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should findAll', async () => {
    const findAllFn = jest.spyOn(service['repository'], 'findAll').mockResolvedValue(storesMock);

    const stores = await service.findAll();

    expect(findAllFn).toBeCalled();
    expect(stores).toEqual(storesMock);
  });
  it('should findById', async () => {
    const findByIdFn = jest.spyOn(service['repository'], 'findOne').mockResolvedValue(storesMock[0]);

    const store = await service.findById(storesMock[0].id);

    expect(findByIdFn).toBeCalled();
    expect(store).toEqual(storesMock[0]);
  });
  it('should create new store', async () => {
    const createFn = jest.spyOn(service, 'create');

    const store = await service.create({ name: 'new store', active: true, leafletLink: '' });

    expect(createFn).toBeCalled();
    expect(store).toBeTruthy();
  });
  it('should update store', async () => {
    const updateFn = jest.spyOn(service, 'update');

    await service.update(savedStoreMock);

    expect(updateFn).toBeCalled();
  });
});
