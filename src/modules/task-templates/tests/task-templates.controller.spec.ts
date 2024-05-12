import { Test, TestingModule } from '@nestjs/testing';
import { TaskTemplatesService } from '../services/task-templates.service';
import { TaskTemplatesController } from '../task-templates.controller';
import {
  createTaskTemplateMockDto,
  savedTaskTemplateMock,
  updateTaskTemplateMockDto,
} from './__mocks__/task-templates.mocks';

describe('TaskTemplatesController', () => {
  let controller: TaskTemplatesController;
  let service: TaskTemplatesService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TaskTemplatesController],
      providers: [
        {
          provide: TaskTemplatesService,
          useValue: {
            findAll: () => jest.fn(),
            create: () => jest.fn(),
            update: () => jest.fn(),
            delete: () => jest.fn(),
          },
        },
      ],
    }).compile();

    controller = app.get<TaskTemplatesController>(TaskTemplatesController);
    service = app.get<TaskTemplatesService>(TaskTemplatesService);
  });
  it('should call findAll by loggedInUser', async () => {
    const findAllFn = jest.spyOn(service, 'findAll');
    await controller.findAll();
    expect(findAllFn).toBeCalled();
  });
  it('should call create', async () => {
    const createFn = jest.spyOn(service, 'create');
    await controller.create(createTaskTemplateMockDto);
    expect(createFn).toBeCalled();
  });
  it('should call create', async () => {
    const createFn = jest.spyOn(service, 'create');
    await controller.create(createTaskTemplateMockDto);
    expect(createFn).toBeCalled();
  });
  it('should call update', async () => {
    const updateFn = jest.spyOn(service, 'update');
    await controller.update(updateTaskTemplateMockDto);
    expect(updateFn).toBeCalled();
  });
  it('should call delete', async () => {
    const deleteFn = jest.spyOn(service, 'delete');
    await controller.delete({ id: savedTaskTemplateMock[0].id });
    expect(deleteFn).toBeCalled();
  });
});
