import { Injectable } from '@nestjs/common';
import { RedisService } from '../modules/libs/redis/redis.service';
import { StoresFixtureService } from './services/stores-fixture.service';
import { UsersFixtureService } from './services/users-fixture.service';
import { TasksFixtureService } from './services/tasks-fixture.service';
import { SectionsFixtureService } from './services/sections-fixture.service';

@Injectable()
export class FixturesService {
  constructor(
    private readonly db: RedisService,
    public readonly stores: StoresFixtureService,
    public readonly users: UsersFixtureService,
    public readonly tasks: TasksFixtureService,
    public readonly sections: SectionsFixtureService,
  ) {}

  async resetDatabase(): Promise<void> {
    console.log('Resetting database...');
    await this.db.reset();
  }
}
