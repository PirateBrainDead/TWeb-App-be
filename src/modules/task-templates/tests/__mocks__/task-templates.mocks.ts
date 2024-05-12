import { addDaysWithFormat } from '../../../../shared/utils/date.utils';
import { savedSectionsMock } from '../../../sections/tests/__mocks__/sections.mocks';
import { TaskTemplate } from '../../entity/task-template.entity';
import { CreateTaskTemplateDto, UpdateTaskTemplateDto } from '../../dto/create-task-template.dto';

export const createTaskTemplateMockDto: CreateTaskTemplateDto = {
  name: 'First task template',
  description: '',
  sectionIds: [...savedSectionsMock[0].id],
  prioritize: false,
  endDate: addDaysWithFormat(new Date(), 3),
  estimatedTime: '00:15',
  repeatDaysInWeek: [0, 1],
  attachments: {
    admin: ['ef22c24e-8600-4e7f-992b-e5584e600924'],
    hq: ['ef22c24e-8600-4e7f-992b-e5584e600924'],
  },
  comments: ['comment 1', 'comment 2'],
  checklist: {
    items: [
      {
        name: 'Item 1',
        isChecked: true,
      },
    ],
  },
};

export const savedTaskTemplateMock: TaskTemplate[] = [
  {
    id: 'ef22c24e-8600-4e7f-992b-e5584e600924',
    ...createTaskTemplateMockDto,
  },
];

export const updateTaskTemplateMockDto: UpdateTaskTemplateDto = {
  id: savedTaskTemplateMock[0].id,
  name: 'Updated task template',
  description: 'New description',
  sectionIds: [...savedSectionsMock[0].id],
  prioritize: false,
  endDate: addDaysWithFormat(new Date(), 3),
  estimatedTime: '00:15',
  repeatDaysInWeek: [0, 1],
  attachments: {
    admin: ['ef22c24e-8600-4e7f-992b-e5584e600924'],
    hq: ['ef22c24e-8600-4e7f-992b-e5584e600924'],
  },
  comments: ['comment 1', 'comment 2'],
  checklist: {
    items: [
      {
        name: 'Item 1',
        isChecked: true,
      },
    ],
  },
};
