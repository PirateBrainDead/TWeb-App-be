import { Test, TestingModule } from '@nestjs/testing';
import { UpdateStoreDto } from '../dto/update-store.dto';
import { StoresService } from '../services/stores.service';
import { savedStoreMock, savedStoreWithUsersMock, updateStoreDtoMock } from './__mocks__/stores.mock';
import { loggedInUserMock, usersMock } from '../../users/tests/__mocks__/users.mock';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersRepository } from '../../users/users.repository';
import { StoresRepository } from '../stores.repository';
import { StoresValidationService } from '../services/stores-validation.service';
import { UsersValidationService } from '../../users/services/users-validation.service';
import { storeIdMock } from '../../tasks/tests/__mocks__/tasks.mocks';
import { Store } from '../entity/store.entity';

describe('StoresService', () => {
  let service: StoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        StoresValidationService,
        UsersValidationService,
        EventEmitter2,
        {
          provide: StoresRepository,
          useValue: {
            findAll: async () => jest.fn(),
            findById: async () => jest.fn(),
            update: async () => jest.fn(),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findAll: async () => jest.fn(),
          },
        },
        {
          provide: CellClsService,
          useValue: {
            storeId: loggedInUserMock.storeId,
            userId: loggedInUserMock.userId,
          },
        },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('GetAll', () => {
    it('should get all stores with users', async () => {
      jest.spyOn(service['storesRepository'], 'findAll').mockResolvedValue([savedStoreMock]);
      jest.spyOn(service['usersRepository'], 'findAll').mockResolvedValue(usersMock);

      const storesWithUsers = await service.findAll();

      expect(storesWithUsers).toEqual([savedStoreWithUsersMock]);
    });
  });
  describe('GetUserStore', () => {
    it('should get user store', async () => {
      const findOneFn = jest.spyOn(service['storesRepository'], 'findById').mockResolvedValue({ ...savedStoreMock });
      const store = await service.findById();

      expect(findOneFn).toBeCalled();
      expect(store).toEqual(savedStoreMock);
    });
  });
  describe('UpdateStore', () => {
    it('should update store', async () => {
      jest.spyOn(service['storesRepository'], 'findById').mockResolvedValue({ ...savedStoreMock });
      const updateFn = jest.spyOn(service['storesRepository'], 'update');

      const updateStoreDto = {
        ...updateStoreDtoMock,
      } as UpdateStoreDto;

      const isUpdated = await service.update(updateStoreDto);

      expect(updateFn).toBeCalledWith(savedStoreMock);
      expect(isUpdated).toBeTruthy();
    });
  });
  describe('Update store activation', () => {
    it('should update store activation', async () => {
      jest.spyOn(service['storesRepository'], 'findById').mockResolvedValue({ ...savedStoreMock });
      const updateFn = jest.spyOn(service['storesRepository'], 'update');

      const isUpdated = await service.updateActivation({ id: storeIdMock, activate: false });
      const updateStoredStore: Store = { ...savedStoreMock, active: false };

      expect(updateFn).toBeCalledWith(updateStoredStore);
      expect(isUpdated).toBeTruthy();
    });
  });
});
