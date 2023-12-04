import { get } from 'lodash';

export const arrayToDictionary = <T>(
  array: T[],
  keyStr = 'id',
): Record<string, T> => {
  return array.reduce((acc, cur) => {
    const arrayItemKey = get(cur, keyStr);
    acc[arrayItemKey] = cur;
    return acc;
  }, {});
};
