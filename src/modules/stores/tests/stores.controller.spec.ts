import { Test, TestingModule } from '@nestjs/testing';
import { StoresController } from '../stores.controller';
import { StoresService } from '../services/stores.service';
import { createStoreDtoMock, updateStoreDtoMock } from './__mocks__/stores.mock';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateStoreDto } from '../dto/update-store.dto';
import { storeIdMock } from '../../tasks/tests/__mocks__/tasks.mocks';

describe('StoresController', () => {
  let storesController: StoresController;
  let storesService: StoresService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [
        {
          provide: StoresService,
          useValue: {
            findAll: () => jest.fn(),
            findById: () => jest.fn(),
            create: () => jest.fn(),
            update: () => jest.fn(),
            updateActivation: () => jest.fn(),
          },
        },
      ],
    }).compile();

    storesController = app.get<StoresController>(StoresController);
    storesService = app.get<StoresService>(StoresService);
  });
  describe('FindAll', () => {
    it('should call findAll', async () => {
      const findAllFn = jest.spyOn(storesService, 'findAll');
      await storesController.findAll();
      expect(findAllFn).toBeCalled();
    });
  });
  describe('FindById', () => {
    it('should call findById', async () => {
      const findByIdFn = jest.spyOn(storesService, 'findById');
      await storesController.findByCurrentUserStore();
      expect(findByIdFn).toBeCalled();
    });
  });
  describe('Update Store', () => {
    it('should call update', async () => {
      const updateFn = jest.spyOn(storesService, 'update');
      await storesController.update(updateStoreDtoMock);
      expect(updateFn).toBeCalled();
    });

    it('should throw if leafletLink is not url', async () => {
      const updateStoreDto = {
        ...updateStoreDtoMock,
        leafletLink: 'not valid url',
      } as UpdateStoreDto;

      const invalidObject = plainToInstance(UpdateStoreDto, updateStoreDto);

      const errors = await validate(invalidObject);

      expect(errors.length).not.toBe(0);
    });
  });
  describe('Create Store', () => {
    it('should call create', async () => {
      const createFn = jest.spyOn(storesService, 'create');
      await storesController.create(createStoreDtoMock);
      expect(createFn).toBeCalled();
    });
  });
  describe('Update Store activation', () => {
    it('should call update activation', async () => {
      const updateActivationFn = jest.spyOn(storesService, 'updateActivation');
      await storesController.updateActivation({ id: storeIdMock, activate: true });
      expect(updateActivationFn).toBeCalled();
    });
  });
});
