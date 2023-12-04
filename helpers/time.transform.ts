export const secsToString = (secs: number): string => {
  const hrs = Math.floor(secs / 3600);
  const min = Math.floor(secs / 60 - hrs * 60);
  const sec = secs - min * 60 - hrs * 3600;
  return [
    hrs > 0 ? `${hrs}h` : '',
    min > 0 ? `${min}m` : '',
    sec > 0 ? `${sec}s` : '',
  ]
    .filter((i) => !!i)
    .join(' ');
};
