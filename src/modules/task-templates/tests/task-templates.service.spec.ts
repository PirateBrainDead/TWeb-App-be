import { Test, TestingModule } from '@nestjs/testing';
import { TaskTemplatesService } from '../services/task-templates.service';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { loggedInUserMock } from '../../users/tests/__mocks__/users.mock';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  createTaskTemplateMockDto,
  savedTaskTemplateMock,
  updateTaskTemplateMockDto,
} from './__mocks__/task-templates.mocks';
import { TaskTemplatesRepository } from '../task-templates.repository';
import { TaskTemplatesValidationService } from '../services/task-templates-validation.service';

describe('TaskTemplatesService', () => {
  let service: TaskTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskTemplatesService,
        TaskTemplatesValidationService,
        EventEmitter2,
        {
          provide: TaskTemplatesRepository,
          useValue: {
            findAll: async () => jest.fn(),
            findById: async () => jest.fn(),
            create: async () => jest.fn(),
            update: async () => jest.fn(),
            delete: async () => jest.fn(),
          },
        },
        {
          provide: CellClsService,
          useValue: {
            userId: loggedInUserMock.userId,
          },
        },
      ],
    }).compile();

    service = module.get<TaskTemplatesService>(TaskTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('FindAll', () => {
    it('should findAll by loggedInUser', async () => {
      jest.spyOn(service['repository'], 'findAll').mockResolvedValue(savedTaskTemplateMock);

      const taskTemplates = await service.findAll();

      expect(taskTemplates).toEqual(savedTaskTemplateMock);
    });
  });
  describe('Create', () => {
    it('should create new task template by loggedInUser', async () => {
      const createFn = jest.spyOn(service['repository'], 'create');

      const isSuccess = await service.create(createTaskTemplateMockDto);

      expect(createFn).toBeCalled();
      expect(isSuccess).toBeTruthy();
    });
  });
  describe('Update', () => {
    it('should update task template by loggedInUser', async () => {
      const updateFn = jest.spyOn(service['repository'], 'update');
      jest.spyOn(service['repository'], 'findById').mockResolvedValue(savedTaskTemplateMock[0]);

      const isSuccess = await service.update(updateTaskTemplateMockDto);

      expect(updateFn).toBeCalled();
      expect(isSuccess).toBeTruthy();
    });
  });
  describe('Delete', () => {
    it('should delete by id', async () => {
      const deleteFn = jest.spyOn(service['repository'], 'delete');
      jest.spyOn(service['repository'], 'findById').mockResolvedValue(savedTaskTemplateMock[0]);

      const isSuccess = await service.delete(savedTaskTemplateMock[0].id);

      expect(deleteFn).toBeCalled();
      expect(isSuccess).toBeTruthy();
    });
  });
});
