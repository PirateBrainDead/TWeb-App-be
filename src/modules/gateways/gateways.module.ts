import { Module } from '@nestjs/common';
import { TasksGateway } from './tasks/tasks.gateway';
import { TaskTemplatesGateway } from './task-templates/task-templates.gateway';
import { SectionsGateway } from './sections/sections.gateway';
import { UsersGateway } from './users/users.gateway';
import { StoresGateway } from './stores/stores.gateway';

@Module({
  providers: [TasksGateway, TaskTemplatesGateway, SectionsGateway, UsersGateway, StoresGateway],
})
export class GatewaysModule {}
