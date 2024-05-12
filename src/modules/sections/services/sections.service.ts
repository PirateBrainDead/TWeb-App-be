import { Injectable, NotFoundException } from '@nestjs/common';
import { Section } from '../entity/section.entity';
import { UpdateSectionPlanningDto } from '../dto/update-section-planning.dto';
import { SectionsValidationService } from './sections-validation.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from '../../../shared/constants/evens.constants';
import { SectionsEvent, SectionsPlanningEvent } from '../dto/sections.event';
import { EventSyncStatus } from '../../tasks/dto/tasks.event';
import { CreateSectionDto } from '../dto/create-section.dto';
import { CellClsService } from '../../libs/cls/cell-cls.service';
import { SectionsRepository } from '../sections.repository';
import { TasksService } from '../../tasks/services/tasks.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EditSectionDto } from '../dto/edit-section.dto';

@Injectable()
export class SectionsService {
  constructor(
    private readonly repository: SectionsRepository,
    private readonly tasksService: TasksService,
    private readonly sectionsValidationService: SectionsValidationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly cls: CellClsService,
    @InjectQueue('SECTIONS_QUEUE') private queue: Queue,
  ) {}

  async findAllByStoreId(): Promise<Section[]> {
    return await this.repository.findAll();
  }

  async editSection(editSectionDto: EditSectionDto): Promise<boolean> {
    const updated = await this.repository.updateSectionName(editSectionDto.sectionId, editSectionDto.name);
    if (!updated) {
      throw new NotFoundException(`Section ID not found.`);
    }
    return updated;
  }

  async create(createSectionDto: CreateSectionDto): Promise<boolean> {
    const sections = await this.repository.findAll();
    this.sectionsValidationService.validateUniqueSectionName(createSectionDto.name, sections);
    this.sectionsValidationService.validateUniqueSectionIconName(createSectionDto.iconName, sections);

    const newSection = await this.repository.create(createSectionDto);
    const sectionEvent = {
      storeId: this.cls.storeId,
      syncStatus: EventSyncStatus.CREATED,
      sections: [newSection],
    } as SectionsEvent;
    this.eventEmitter.emit(EVENTS.SECTIONS.CHANGES, sectionEvent);

    return true;
  }

  async updatePlanningStatus({ date, isDone, sectionId }: UpdateSectionPlanningDto): Promise<boolean> {
    const section = await this.repository.findById(sectionId);
    this.sectionsValidationService.validateSectionExists(section);

    const plannedDayExist = section.plannedDays.some((plannedDay) => plannedDay === date);
    this.sectionsValidationService.validateIsSectionAlreadyPlanned(isDone, plannedDayExist);
    this.sectionsValidationService.validateIsSectionAlreadyNotPlanned(isDone, plannedDayExist);

    const sectionPlanningEvent = { storeId: this.cls.storeId, sectionId, date } as SectionsPlanningEvent;
    if (isDone && !plannedDayExist) {
      section.plannedDays.push(date);
      await this.repository.update(section);
      this.eventEmitter.emit(EVENTS.SECTIONS.PLANNING, {
        ...sectionPlanningEvent,
        syncStatus: EventSyncStatus.CREATED,
      } as SectionsPlanningEvent);
      return true;
    }
    if (!isDone && plannedDayExist) {
      const plannedDayIndex = section.plannedDays.findIndex((plannedDay) => plannedDay === date);
      section.plannedDays.splice(plannedDayIndex);
      await this.repository.update(section);

      this.eventEmitter.emit(EVENTS.SECTIONS.PLANNING, {
        ...sectionPlanningEvent,
        syncStatus: EventSyncStatus.DELETED,
      } as SectionsPlanningEvent);

      return true;
    }
  }

  async delete(sectionIds: string[]) {
    const storeId = this.cls.storeId;
    return this.queue.add('DELETE_SECTION_TASKS', {
      sectionIds,
      storeId,
    });
  }

  async closeQueue() {
    this.queue.close();
  }
}
