import { Injectable } from '@nestjs/common';
import { TaskTemplate } from '../entity/task-template.entity';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskTemplatesEvent } from '../dto/task-templates.event';
import { EventSyncStatus } from '../../tasks/dto/tasks.event';
import { EVENTS } from '../../../shared/constants/evens.constants';
import { TaskTemplatesValidationService } from './task-templates-validation.service';
import { TaskTemplatesRepository } from '../task-templates.repository';
import { CreateTaskTemplateDto, UpdateTaskTemplateDto } from '../dto/create-task-template.dto';

@Injectable()
export class TaskTemplatesService {
  constructor(
    private readonly repository: TaskTemplatesRepository,
    private readonly taskTemplatesValidationService: TaskTemplatesValidationService,
    private readonly cls: CellClsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(): Promise<TaskTemplate[]> {
    return await this.repository.findAll();
  }

  async create(taskTemplateDto: CreateTaskTemplateDto): Promise<boolean> {
    const newTaskTemplate = await this.repository.create(taskTemplateDto);

    this.emitEvent([newTaskTemplate], EventSyncStatus.CREATED);

    return true;
  }

  async update(taskTemplateDto: UpdateTaskTemplateDto): Promise<boolean> {
    const taskTemplate = await this.repository.findById(taskTemplateDto.id);
    await this.taskTemplatesValidationService.validateTaskTemplateExists(taskTemplate);

    const updatedTaskTemplate: TaskTemplate = { id: taskTemplate.id, ...taskTemplateDto };
    await this.repository.update(updatedTaskTemplate);

    this.emitEvent([updatedTaskTemplate], EventSyncStatus.UPDATED, taskTemplateDto.id);

    return true;
  }

  async delete(id: string): Promise<boolean> {
    const taskTemplate = await this.repository.findById(id);
    await this.taskTemplatesValidationService.validateTaskTemplateExists(taskTemplate);
    await this.repository.delete(id);

    this.emitEvent([], EventSyncStatus.DELETED, id);

    return true;
  }

  private emitEvent(taskTemplates: TaskTemplate[], syncStatus: EventSyncStatus, idForDelete?: string): void {
    const event: TaskTemplatesEvent = { userId: this.cls.userId, syncStatus, taskTemplates, idForDelete };
    this.eventEmitter.emit(EVENTS.TASK_TEMPLATES.CHANGES, event);
  }
}
