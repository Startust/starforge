export const round2 = (num: number | undefined): number => {
  if (num === undefined) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};
