import { groupBy } from '../group-by.utils';

const john = { name: 'John', gender: 0 };
const joe = { name: 'Joe', gender: 1 };

describe('GroupBy', () => {
  it('should group data by name', () => {
    const groupedData = groupBy([john, john, joe], 'name');
    expect(groupedData).toEqual({
      John: [john, john],
      Joe: [joe],
    });
  });
});
