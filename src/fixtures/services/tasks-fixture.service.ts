import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Section } from '../../modules/sections/entity/section.entity';
import { Store } from '../../modules/stores/entity/store.entity';
import { RepeatableTask, Task, TaskStatus } from '../../modules/tasks/entity/task.entity';
import { Repository } from '../../shared/repository/repository.service';
import { DB_KEYS } from '../../shared/utils/db.utils';
import { addDaysWithFormat, dateNowFormatted } from '../../shared/utils/date.utils';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '../../shared/constants/date.constants';

@Injectable()
export class TasksFixtureService {
  constructor(private readonly repository: Repository) {}

  async seedRepeatable(store: Store, sections: Section[]): Promise<RepeatableTask[]> {
    console.log('Seeding repeatable tasks...');

    const tomorrow = addDaysWithFormat(new Date(), 1);
    const newEndDate = dayjs(tomorrow, DATE_FORMAT).add(3, 'y').format(DATE_FORMAT);

    const repeatableTasks: RepeatableTask[] = [];
    for (let i = 0; i < 1000; i++) {
      const sectionId = sections[Math.floor(Math.random() * sections.length)].id;
      const repeatableTask: RepeatableTask = {
        id: uuidv4(),
        name: `Task ${i}`,
        description: `Random daily desc: '${i}`.repeat(35),
        sectionId,
        prioritize: false,
        repeatDaysInWeek: [2, 3, 4, 5, 6],
        startTime: '14:30',
        startDate: tomorrow,
        estimatedTime: '00:15',
        endDate: newEndDate,
      };
      repeatableTasks.push(repeatableTask);
    }

    await this.repository.createMany(DB_KEYS.TASKS.REPEATS(store.id), repeatableTasks);

    return repeatableTasks;
  }

  async seedDaily(store: Store, repeatableTasks: RepeatableTask[]): Promise<void> {
    console.log('Seeding daily tasks...');
    const tasks: Task[] = [];
    const today = dateNowFormatted();
    for (let i = 0; i < 100; i++) {
      const repeatableTask = repeatableTasks[i];
      const task: Task = {
        id: uuidv4(),
        date: today,
        name: repeatableTask.name,
        description: repeatableTask.description,
        prioritize: false,
        sectionId: repeatableTask.sectionId,
        startTime: '14:30',
        estimatedTime: '00:15',
        status: TaskStatus.TODO,
        repeatableTaskId: repeatableTask.id,
        recentActualTimes: [],
        attachments: { admin: [], hq: [] },
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

      tasks.push(task);
    }

    await this.repository.createMany(DB_KEYS.TASKS.DAILY(store.id, today), tasks);
  }
}
