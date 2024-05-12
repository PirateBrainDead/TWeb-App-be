export const partition = <T>(array: T[], callback: (element: T, index: number, array: T[]) => boolean): [T[], T[]] => {
  return array.reduce(
    (result, element, i) => {
      callback(element, i, array) ? result[0].push(element) : result[1].push(element);

      return result;
    },
    [[], []],
  );
};
