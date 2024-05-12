import { Module } from '@nestjs/common';
import { SectionsService } from './services/sections.service';
import { SectionsController } from './sections.controller';
import { Repository } from '../../shared/repository/repository.service';
import { SectionsValidationService } from './services/sections-validation.service';
import { SectionsRepository } from './sections.repository';
import { TasksModule } from '../tasks/tasks.module';
import { SectionQueueConsumer } from './sections.queue.consumer';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisConfig } from '../../config/config.types';
@Module({
  imports: [
    TasksModule,
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<RedisConfig>('redis').host,
          port: configService.get<RedisConfig>('redis').port,
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'SECTIONS_QUEUE',
    }),
  ],
  controllers: [SectionsController],
  providers: [SectionsService, SectionsValidationService, SectionsRepository, Repository, SectionQueueConsumer],
  exports: [SectionsService],
})
export class SectionsModule {}
