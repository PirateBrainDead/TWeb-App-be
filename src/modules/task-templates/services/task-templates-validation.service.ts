import { Injectable, NotFoundException } from '@nestjs/common';
import { Errors } from '../../../shared/constants/errors.constants';
import { TaskTemplate } from '../entity/task-template.entity';

@Injectable()
export class TaskTemplatesValidationService {
  async validateTaskTemplateExists(taskTemplate?: TaskTemplate): Promise<void> {
    if (!taskTemplate) {
      throw new NotFoundException(Errors.TaskTemplateNotFound);
    }
  }
}
