import { Module } from '@nestjs/common';
import { RedisModule } from './modules/libs/redis/redis.module';
import { FixturesModule } from './fixtures/fixtures.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { GatewaysModule } from './modules/gateways/gateways.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SectionsModule } from './modules/sections/sections.module';
import { StoresModule } from './modules/stores/stores.module';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulesModule } from './schedules/schedules.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CellClsModule } from './modules/libs/cls/cell-cls.module';
import { TaskTemplatesModule } from './modules/task-templates/task-templates.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    RedisModule,
    FixturesModule,
    AuthModule,
    UsersModule,
    TasksModule,
    TaskTemplatesModule,
    SectionsModule,
    StoresModule,
    GatewaysModule,
    NotificationsModule,
    SchedulesModule,
    CellClsModule,
    ConfigModule.forRoot({ load: [config], isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
