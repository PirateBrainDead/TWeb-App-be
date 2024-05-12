import { CreateTaskDto } from '../../dto/create-task.dto';
import { RepeatableTask, Task, TaskStatus } from '../../entity/task.entity';
import { addDaysWithFormat, dateNowFormatted } from '../../../../shared/utils/date.utils';
import { UpdateTaskDto } from '../../dto/update-task.dto';
import { UpdateTaskStatusDto } from '../../dto/update-task-status.dto';

export const storeIdMock = 'ce3a4574-38b1-4d8b-8918-3dcce2a80520';

export const createTaskMockDto: CreateTaskDto = {
  prioritize: false,
  name: 'First task',
  description: 'First task',
  startDate: dateNowFormatted(),
  endDate: addDaysWithFormat(new Date(), 3),
  startTime: '18:40',
  estimatedTime: '00:15',
  repeatDaysInWeek: [0, 1],
  sectionIds: ['1ebc7a2f-2ff8-4c3c-9832-5303918dd16a'],
  attachments: {
    admin: ['1ebc7a2f-2ff8-4c3c-9832-5303918dd16a'],
    hq: ['1ebc7a2f-2ff8-4c3c-9832-5303918dd16a'],
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

export const updateTaskMockDto: UpdateTaskDto = {
  id: '8e9f8954-0928-43b4-bd14-c095216ea52e',
  date: dateNowFormatted(),
  allEvents: false,
  prioritize: false,
  name: 'First task',
  description: 'First task',
  endDate: addDaysWithFormat(new Date(), 3),
  startTime: '18:40',
  estimatedTime: '00:15',
  repeatDaysInWeek: [0, 1],
  attachments: {
    admin: ['1ebc7a2f-2ff8-4c3c-9832-5303918dd16a'],
    hq: ['1ebc7a2f-2ff8-4c3c-9832-5303918dd16a'],
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

export const updateTasStatusMockDto = {
  id: '8e9f8954-0928-43b4-bd14-c095216ea52e',
  status: TaskStatus.DONE,
} as UpdateTaskStatusDto;

export const savedRepeatableTasksMock: RepeatableTask[] = [
  {
    id: '8e9f8954-0928-43b4-bd14-c095216ea52e',
    prioritize: false,
    name: 'First task',
    description: 'First task',
    startDate: dateNowFormatted(),
    endDate: addDaysWithFormat(new Date(), 3),
    startTime: '18:40',
    estimatedTime: '00:15',
    repeatDaysInWeek: [0, 1],
    sectionId: '1ebc7a2f-2ff8-4c3c-9832-5303918dd16a',
    attachments: {
      admin: ['1ebc7a2f-2ff8-4c3c-9832-5303918dd16a'],
      hq: ['1ebc7a2f-2ff8-4c3c-9832-5303918dd16a'],
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
  },
];

export const savedTasksMock = [
  {
    id: '8e9f8954-0928-43b4-bd14-c095216ea52e',
    prioritize: false,
    name: 'First task',
    description: 'First task',
    date: dateNowFormatted(),
    startTime: '18:40',
    estimatedTime: '00:15',
    sectionId: '1ebc7a2f-2ff8-4c3c-9832-5303918dd16a',
    status: TaskStatus.TODO,
    repeatableTaskId: '8e9f8954-0928-43b4-bd14-c095216ea52e',
    endDate: addDaysWithFormat(new Date(), 3),
    repeatDaysInWeek: [0, 1],
    attachments: {
      admin: ['1ebc7a2f-2ff8-4c3c-9832-5303918dd16a'],
      hq: ['1ebc7a2f-2ff8-4c3c-9832-5303918dd16a'],
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
  },
] as Task[];
