import { Test, TestingModule } from '@nestjs/testing';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { loggedInUserMock } from '../../users/tests/__mocks__/users.mock';
import {
  createTaskTemplateMockDto,
  savedTaskTemplateMock,
  updateTaskTemplateMockDto,
} from './__mocks__/task-templates.mocks';
import { TaskTemplatesRepository } from '../task-templates.repository';
import { Repository } from '../../../shared/repository/repository.service';

describe('TaskTemplatesRepository', () => {
  let service: TaskTemplatesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskTemplatesRepository,
        {
          provide: Repository,
          useValue: {
            findAll: async () => jest.fn(),
            findOne: async () => jest.fn(),
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

    service = module.get<TaskTemplatesRepository>(TaskTemplatesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should findAll', async () => {
    const findAllFn = jest.spyOn(service['repository'], 'findAll').mockResolvedValue(savedTaskTemplateMock);

    const taskTemplates = await service.findAll();

    expect(findAllFn).toBeCalled();
    expect(taskTemplates).toEqual(savedTaskTemplateMock);
  });
  it('should findById', async () => {
    const findByIdFn = jest.spyOn(service['repository'], 'findOne').mockResolvedValue(savedTaskTemplateMock[0]);

    const taskTemplate = await service.findById(savedTaskTemplateMock[0].id);

    expect(findByIdFn).toBeCalled();
    expect(taskTemplate).toEqual(savedTaskTemplateMock[0]);
  });
  it('should create new task template', async () => {
    const createFn = jest.spyOn(service, 'create');

    const isSuccess = await service.create(createTaskTemplateMockDto);

    expect(createFn).toBeCalled();
    expect(isSuccess).toBeTruthy();
  });
  it('should update task template', async () => {
    const updateFn = jest.spyOn(service, 'update');

    await service.update(updateTaskTemplateMockDto);

    expect(updateFn).toBeCalled();
  });
  it('should delete by id', async () => {
    const deleteFn = jest.spyOn(service, 'delete');

    await service.delete(savedTaskTemplateMock[0].id);

    expect(deleteFn).toBeCalled();
  });
});
