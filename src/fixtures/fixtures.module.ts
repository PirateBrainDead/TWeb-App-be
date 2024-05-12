import { Module } from '@nestjs/common';
import { FixturesService } from './fixtures.service';
import { StoresFixtureService } from './services/stores-fixture.service';
import { Repository } from '../shared/repository/repository.service';
import { UsersFixtureService } from './services/users-fixture.service';
import { TasksFixtureService } from './services/tasks-fixture.service';
import { SectionsFixtureService } from './services/sections-fixture.service';

@Module({
  imports: [],
  providers: [
    FixturesService,
    StoresFixtureService,
    UsersFixtureService,
    Repository,
    TasksFixtureService,
    SectionsFixtureService,
  ],
  exports: [FixturesService],
})
export class FixturesModule {}
