import { addDaysWithFormat, formatDate, getAllDatesBetween, sortDates, subtractDaysWithFormat } from '../date.utils';
import { SortOrder } from '../types';

const datesForSort = ['2023-03-03', '2023-03-01', '2023-03-09'];
const datesAscending = ['2023-03-01', '2023-03-03', '2023-03-09'];
const datesDescending = ['2023-03-09', '2023-03-03', '2023-03-01'];

describe('DateUtils', () => {
  it('should return formatted date', () => {
    expect(formatDate('2023-2-2')).toBe('2023-02-02');
  });
  it('should return same date', () => {
    expect(formatDate('2023-02-02')).toBe('2023-02-02');
  });
  it('should add n days to provided date', () => {
    expect(addDaysWithFormat('2023-02-02', 1)).toStrictEqual('2023-02-03');
  });
  it('should subtract n days to provided date', () => {
    expect(subtractDaysWithFormat('2023-02-02', 1)).toStrictEqual('2023-02-01');
  });
  describe('getAllDatesBetween', () => {
    it('should getAllDatesBetween', () => {
      const datesBetween = getAllDatesBetween('2023-03-01', '2023-03-05', [0, 1, 2, 3, 4, 5, 6]);
      expect(datesBetween).toStrictEqual(['2023-03-02', '2023-03-03', '2023-03-04', '2023-03-05']);
    });
  });
  describe('sortDates', () => {
    it('should sortDates - ASCENDING', () => {
      const sortedDates = sortDates(datesForSort);
      expect(sortedDates).toStrictEqual(datesAscending);
    });
    it('should sortDates - DESCENDING', () => {
      const sortedDates = sortDates(datesForSort, SortOrder.DESC);
      expect(sortedDates).toStrictEqual(datesDescending);
    });
  });
});
