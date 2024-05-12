import { Injectable } from '@nestjs/common';
import { DB_KEYS } from '../../shared/utils/db.utils';
import { CellClsService } from '../libs/cls/cell-cls.service';
import { Repository } from '../../shared/repository/repository.service';
import { TaskTemplate } from './entity/task-template.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreateTaskTemplateDto } from './dto/create-task-template.dto';

@Injectable()
export class TaskTemplatesRepository {
  constructor(private readonly repository: Repository, private readonly cls: CellClsService) {}

  get dbKey(): string {
    return DB_KEYS.TASK_TEMPLATES.ALL_BY_USER(this.cls.userId);
  }

  async findAll(): Promise<TaskTemplate[]> {
    return await this.repository.findAll<TaskTemplate>(this.dbKey);
  }

  async findById(id: string): Promise<TaskTemplate> {
    return await this.repository.findOne<TaskTemplate>(this.dbKey, id);
  }

  async create(taskTemplate: CreateTaskTemplateDto): Promise<TaskTemplate> {
    const newTaskTemplate: TaskTemplate = { id: uuidv4(), ...taskTemplate };
    await this.repository.create<TaskTemplate>(this.dbKey, newTaskTemplate);
    return newTaskTemplate;
  }

  async update(taskTemplate: TaskTemplate): Promise<void> {
    await this.repository.update<TaskTemplate>(this.dbKey, taskTemplate);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete<TaskTemplate>(this.dbKey, id);
  }
}
