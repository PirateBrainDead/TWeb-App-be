import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TasksService } from '../tasks/services/tasks.service';
import { SectionsRepository } from './sections.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventSyncStatus } from '../tasks/dto/tasks.event';
import { EVENTS } from '../../shared/constants/evens.constants';
import { SectionsEvent } from './dto/sections.event';

@Processor('SECTIONS_QUEUE')
export class SectionQueueConsumer {
  constructor(
    private readonly tasksService: TasksService,
    private readonly sectionRepository: SectionsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Process('DELETE_SECTION_TASKS')
  async deleteSectionTasks(job: Job) {
    console.log('DELETE_SECTION_TASKS Job started with job id: ', job.id);

    try {
      await this.tasksService.deleteAllSectionTasks(job.data.sectionIds, job.data.storeId);
      for (const sectionId of job.data.sectionIds) {
        await this.sectionRepository.delete(sectionId, job.data.storeId);
      }
      return;
    } catch (error) {
      throw error;
    }
  }

  @OnQueueCompleted()
  async OnCompleted(job: Job) {
    const sectionEvent = {
      storeId: job.data.storeId,
      syncStatus: EventSyncStatus.DELETED,
      sections: job.data.sectionIds,
    } as SectionsEvent;

    this.eventEmitter.emit(EVENTS.SECTIONS.DELETED, sectionEvent);
    console.log('Job Completed with deleting the following section IDs:', job.data.sectionIds);
  }

  @OnQueueFailed()
  handler(job: Job, error: Error) {
    const sectionEvent = {
      storeId: job.data.storeId,
      syncStatus: EventSyncStatus.DELETE_FAILED,
      sections: job.data.sectionIds,
    } as SectionsEvent;

    this.eventEmitter.emit(EVENTS.SECTIONS.DELETE_FAILED, sectionEvent);

    console.log(
      'Job Failed with deleting the following section IDs:',
      job.data.sectionIds,
      'having the errors: ',
      error,
    );
  }
}
