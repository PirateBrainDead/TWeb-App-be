import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TasksValidationService } from '../services/tasks-validation.service';
import { TaskStatus } from '../entity/task.entity';
import { Errors } from '../../../shared/constants/errors.constants';

describe('TasksValidationService', () => {
  let service: TasksValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksValidationService],
    }).compile();

    service = module.get<TasksValidationService>(TasksValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should throw NotFoundException on validateTaskExists', () => {
    try {
      service.validateTaskExists(undefined);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.response.message).toEqual(Errors.TaskNotFound);
    }
  });
  it('should throw BadRequestException on validateTaskDeleteStatus', () => {
    try {
      service.validateTaskDeleteStatus(TaskStatus.DONE);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.response.message).toEqual(Errors.TaskInProvidedStatusCantBeDeleted);
    }
  });
  it('should throw BadRequestException on validateTaskUpdateStatus - update to DONE', () => {
    try {
      service.validateTaskUpdateStatus(TaskStatus.TODO, TaskStatus.DONE);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.response.message).toEqual(Errors.TaskMustBeInInitiatedStatus);
    }
  });
  it('should throw BadRequestException on validateTaskUpdateStatus - update to INITIATED', () => {
    try {
      service.validateTaskUpdateStatus(TaskStatus.DONE, TaskStatus.INITIATED);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.response.message).toEqual(Errors.TaskMustBeInTodoStatus);
    }
  });
});
