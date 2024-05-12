import { addAllTasksStatisticsPerDay } from '../statistics.utils';
import {
  statisticsMock,
  weeklyStatisticsMock,
  weeklyStatisticsWithAllEmptyTasksMock,
  weeklyStatisticsWithAllTasksMock,
} from '../../../modules/statistics/__mocks__/statistics.mock';
import { allTasks } from '../tasks.utils';

describe('Statistics', () => {
  it('should addAllTasksStatisticsPerDay', () => {
    const weeklyStatistics = { ...weeklyStatisticsMock };

    addAllTasksStatisticsPerDay(weeklyStatistics);

    expect(weeklyStatistics).toEqual(weeklyStatisticsWithAllTasksMock);
  });
  it('should addAllTasksEmptyStatisticsPerDay', () => {
    delete statisticsMock[allTasks];
    const weeklyStatistics = { ...weeklyStatisticsMock, '2023-03-04': null };

    addAllTasksStatisticsPerDay(weeklyStatistics);

    expect(weeklyStatistics).toEqual(weeklyStatisticsWithAllEmptyTasksMock);
  });
});
