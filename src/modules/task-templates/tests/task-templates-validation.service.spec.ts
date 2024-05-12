import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Errors } from '../../../shared/constants/errors.constants';
import { TaskTemplatesValidationService } from '../services/task-templates-validation.service';

describe('TaskTemplatesValidationService', () => {
  let service: TaskTemplatesValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskTemplatesValidationService],
    }).compile();

    service = module.get<TaskTemplatesValidationService>(TaskTemplatesValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should throw NotFoundException on validateExists', async () => {
    try {
      await service.validateTaskTemplateExists(undefined);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.response.message).toEqual(Errors.TaskTemplateNotFound);
    }
  });
});
