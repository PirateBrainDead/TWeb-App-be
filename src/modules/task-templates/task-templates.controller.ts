import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { TaskTemplatesService } from './services/task-templates.service';
import { Role } from '../users/entities/role.enum';
import { HasRoles } from '../../shared/decorators/roles/has-roles.decorator';
import {
  ApiCreateTaskTemplate,
  ApiDeleteTaskTemplate,
  ApiGetTaskTemplates,
  ApiUpdateTaskTemplate,
} from './task-templates.swagger';
import { TaskTemplate } from './entity/task-template.entity';
import { CreateTaskTemplateDto, UpdateTaskTemplateDto } from './dto/create-task-template.dto';
import { DeleteTaskTemplateDto } from './dto/delete-task-template.dto';

@ApiBearerAuth()
@ApiTags('task-templates')
@Controller('task-templates')
export class TaskTemplatesController {
  constructor(private readonly taskTemplatesService: TaskTemplatesService) {}

  @ApiGetTaskTemplates()
  @Get()
  @HasRoles(Role.Manager)
  async findAll(): Promise<TaskTemplate[]> {
    return await this.taskTemplatesService.findAll();
  }

  @ApiCreateTaskTemplate()
  @Post()
  @HasRoles(Role.Manager)
  async create(@Body() taskTemplateDto: CreateTaskTemplateDto): Promise<boolean> {
    return this.taskTemplatesService.create(taskTemplateDto);
  }

  @ApiUpdateTaskTemplate()
  @Put()
  @HasRoles(Role.Manager)
  async update(@Body() taskTemplateDto: UpdateTaskTemplateDto): Promise<boolean> {
    return this.taskTemplatesService.update(taskTemplateDto);
  }

  @ApiDeleteTaskTemplate()
  @Delete()
  @HasRoles(Role.Manager)
  async delete(@Query() { id }: DeleteTaskTemplateDto): Promise<boolean> {
    return this.taskTemplatesService.delete(id);
  }
}
