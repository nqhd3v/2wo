import { get } from 'lodash';

export const arrayToDictionary = <T>(
  array: T[],
  keyStr: keyof T,
): Record<string, T> => {
  return array.reduce((acc, cur) => {
    const arrayItemKey = get(cur, keyStr);
    acc[arrayItemKey] = cur;
    return acc;
  }, {});
};
