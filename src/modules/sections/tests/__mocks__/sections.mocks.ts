import { UpdateSectionPlanningDto } from '../../dto/update-section-planning.dto';
import { savedTasksMock } from '../../../tasks/tests/__mocks__/tasks.mocks';
import { addDaysWithFormat, dateNowFormatted } from '../../../../shared/utils/date.utils';
import { Section } from '../../entity/section.entity';
import { CreateSectionDto } from '../../dto/create-section.dto';

export const createSectionMock = {
  name: 'New Section',
  iconName: 'new-section',
} as CreateSectionDto;

export const updateSectionPlanningDtoMock = {
  sectionId: savedTasksMock[0].sectionId,
  date: dateNowFormatted(),
  isDone: true,
} as UpdateSectionPlanningDto;

export const savedSectionsMock = [
  {
    id: savedTasksMock[0].sectionId,
    name: 'Bread',
    iconName: 'bread',
    plannedDays: [dateNowFormatted()],
  } as Section,
];

export const savedSectionWithNewAddedPlannedDay = {
  id: savedTasksMock[0].sectionId,
  name: 'Bread',
  iconName: 'bread',
  plannedDays: [dateNowFormatted(), addDaysWithFormat(new Date(), 1)],
} as Section;

export const savedSectionEmptyPlannedDays = {
  id: savedTasksMock[0].sectionId,
  name: 'Bread',
  iconName: 'bread',
  plannedDays: [],
} as Section;
