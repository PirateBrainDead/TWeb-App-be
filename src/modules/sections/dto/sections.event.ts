import { EventSyncStatus } from '../../tasks/dto/tasks.event';
import { Section } from '../entity/section.entity';

export type SectionsEvent = {
  storeId: string;
  syncStatus: EventSyncStatus;
  sections: Section[];
  sectionIdForDelete?: string;
};

export type SectionsPlanningEvent = {
  storeId: string;
  syncStatus: EventSyncStatus;
  sectionId: string;
  date: string;
};
