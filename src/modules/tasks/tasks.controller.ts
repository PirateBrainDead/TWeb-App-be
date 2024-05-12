import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Patch, Post, Put, Query } from '@nestjs/common';
import { TasksService } from './services/tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import {
  ApiCreateTask,
  ApiDeleteTask,
  ApiGetDailyTasksByDate,
  ApiGetRepeatableTasksByDate,
  ApiUpdateTask,
  ApiUpdateTaskStatus,
} from './tasks.swagger';
import { QueryDateDto } from './dto/query-date.dto';
import { DeleteTaskDto } from './dto/delete-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Role } from '../users/entities/role.enum';
import { HasRoles } from '../../shared/decorators/roles/has-roles.decorator';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { RepeatableTask, Task } from './entity/task.entity';

@ApiBearerAuth()
@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiGetDailyTasksByDate()
  @Get()
  @HasRoles(Role.Manager, Role.HQ)
  async findDailyByDate(@Query() { date }: QueryDateDto): Promise<Task[]> {
    return await this.tasksService.findDailyByDate(date);
  }

  @ApiGetRepeatableTasksByDate()
  @Get(`repeatable`)
  @HasRoles(Role.Manager)
  async findRepeatableByDate(@Query() { date }: QueryDateDto): Promise<RepeatableTask[]> {
    return await this.tasksService.findRepeatableByDate(date);
  }

  @ApiCreateTask()
  @Post()
  @HasRoles(Role.Manager)
  async create(@Body() taskDto: CreateTaskDto): Promise<boolean> {
    return this.tasksService.create(taskDto);
  }

  @ApiUpdateTask()
  @Put()
  @HasRoles(Role.HQ, Role.Manager)
  async update(@Body() taskDto: UpdateTaskDto): Promise<boolean> {
    return this.tasksService.update(taskDto);
  }

  @ApiUpdateTaskStatus()
  @Patch('status')
  @HasRoles(Role.HQ, Role.Manager)
  async updateStatus(@Body() taskDto: UpdateTaskStatusDto): Promise<boolean> {
    return this.tasksService.updateStatus(taskDto);
  }

  @ApiDeleteTask()
  @Delete()
  @HasRoles(Role.Manager)
  async delete(@Query() taskDto: DeleteTaskDto): Promise<boolean> {
    return this.tasksService.delete(taskDto);
  }
}
