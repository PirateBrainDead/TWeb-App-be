import { Test, TestingModule } from '@nestjs/testing';
import { SectionsService } from '../services/sections.service';
import { SectionsValidationService } from '../services/sections-validation.service';
import {
  createSectionMock,
  savedSectionEmptyPlannedDays,
  savedSectionsMock,
  savedSectionWithNewAddedPlannedDay,
  updateSectionPlanningDtoMock,
} from './__mocks__/sections.mocks';
import { UpdateSectionPlanningDto } from '../dto/update-section-planning.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Errors } from '../../../shared/constants/errors.constants';
import { addDaysWithFormat } from '../../../shared/utils/date.utils';
import { loggedInUserMock } from '../../users/tests/__mocks__/users.mock';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { TasksService } from '../..//tasks/services/tasks.service';
import { SectionsRepository } from '../sections.repository';
import { getQueueToken } from '@nestjs/bull';
import { DeleteTaskService } from '../../tasks/services/delete-task.service';
import { UpdateTaskService } from '../../tasks/services/update-task.service';
import { TasksHelperService } from '../../tasks/services/tasks-helper.service';
import { TasksValidationService } from '../../tasks/services/tasks-validation.service';
import { Repository } from '../../../shared/repository/repository.service';
import { RedisService } from '../../libs/redis/redis.service';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { savedTasksMock } from '../../../modules/tasks/tests/__mocks__/tasks.mocks';

const mockBullQueue: any = {
  add: jest.fn(),
  process: jest.fn(),
  close: jest.fn(),
};

describe('SectionsService', () => {
  let service: SectionsService;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        SectionsService,
        SectionsValidationService,
        EventEmitter2,
        TasksService,
        DeleteTaskService,
        UpdateTaskService,
        TasksHelperService,
        TasksValidationService,
        Repository,
        RedisService,
        {
          provide: getQueueToken('SECTIONS_QUEUE'),
          useValue: mockBullQueue,
        },
        {
          provide: ConfigService,
          useValue: {
            // get: jest.fn().mockImplementation((key: string) => {
            //   if (key === 'redis') {
            //     return { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT, 10) };
            //   }
            // }),
            get: jest.fn(() => 'test'),
          },
        },
        {
          provide: SectionsRepository,
          useValue: {
            findAll: async () => jest.fn(),
            findById: async () => jest.fn(),
            create: async () => jest.fn(),
            update: async () => jest.fn(),
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

    service = moduleRef.get<SectionsService>(SectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('FindAll', () => {
    it('should return all sections by StoreId', async () => {
      jest.spyOn(service['repository'], 'findAll').mockResolvedValue([]);
      const findAllFn = jest.spyOn(service, 'findAllByStoreId');
      const sections = await service.findAllByStoreId();
      expect(findAllFn).toBeCalled();
      expect(sections).toEqual([]);
    });
  });
  describe('Create', () => {
    it('should create new Section', async () => {
      jest.spyOn(service['repository'], 'findAll').mockResolvedValue([...savedSectionsMock]);
      const createFn = jest.spyOn(service['repository'], 'create');
      const response = await service.create(createSectionMock);
      expect(createFn).toBeCalled();
      expect(response).toBeTruthy();
    });
    it('should throw BadRequestException on validateSectionNameUnique', async () => {
      jest.spyOn(service['repository'], 'findAll').mockResolvedValue([...savedSectionsMock]);
      try {
        const createSectionDto = { ...createSectionMock, name: savedSectionsMock[0].name };
        await service.create(createSectionDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toEqual(Errors.SectionNameUnique);
      }
    });
    it('should throw BadRequestException on validateSectionIconNameUnique', async () => {
      jest.spyOn(service['repository'], 'findAll').mockResolvedValue([...savedSectionsMock]);
      try {
        const createSectionDto = { ...createSectionMock, iconName: savedSectionsMock[0].iconName };
        await service.create(createSectionDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toEqual(Errors.SectionIconNameUnique);
      }
    });
  });
  describe('UpdatePlanningStatus', () => {
    it('should add new date to plannedDays for section', async () => {
      jest.spyOn(service['repository'], 'findById').mockResolvedValue({ ...savedSectionsMock[0] });
      const updateFn = jest.spyOn(service['repository'], 'update');

      const date = addDaysWithFormat(new Date(), 1);
      const updateSectionPlanningDto = {
        ...updateSectionPlanningDtoMock,
        date,
      } as UpdateSectionPlanningDto;

      const isUpdated = await service.updatePlanningStatus(updateSectionPlanningDto);

      expect(updateFn).toBeCalledWith(savedSectionWithNewAddedPlannedDay);
      expect(isUpdated).toBeTruthy();
    });
    it('should remove existing date from plannedDays for section', async () => {
      jest.spyOn(service['repository'], 'findById').mockResolvedValue({ ...savedSectionsMock[0] });
      const updateFn = jest.spyOn(service['repository'], 'update');

      const updateSectionPlanningDto = {
        ...updateSectionPlanningDtoMock,
        isDone: false,
      } as UpdateSectionPlanningDto;

      const isUpdated = await service.updatePlanningStatus(updateSectionPlanningDto);

      expect(updateFn).toBeCalledWith(savedSectionEmptyPlannedDays);
      expect(isUpdated).toBeTruthy();
    });
    it('should throw NotFoundException on validateSectionExists', async () => {
      jest.spyOn(service['repository'], 'findById').mockResolvedValue(undefined);
      const updateSectionPlanningDto = {
        ...updateSectionPlanningDtoMock,
        sectionId: 'id',
      } as UpdateSectionPlanningDto;
      try {
        await service.updatePlanningStatus(updateSectionPlanningDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.response.message).toEqual(Errors.SectionNotFound);
      }
    });
  });
  describe('delete sections', () => {
    it('should call queue', async () => {
      const addFn = jest.spyOn(service['queue'], 'add');
      await service.delete([savedTasksMock[0].sectionId]);
      expect(addFn).toBeCalled();
    });
  });
  afterAll(async () => {
    await service.closeQueue();
    await moduleRef.close();
  });
});
