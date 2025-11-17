import { isMonday, isSaturday, previousMonday, previousSaturday } from 'date-fns';

export const getUTCDate = (date: Date): Date => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
};

export const getCurrentMonday = (date: Date): Date => {
  const currentMonday = isMonday(date) ? date : previousMonday(date);

  return getUTCDate(currentMonday);
};

export const getCurrentSaturday = (date: Date): Date => {
  const currentSaturday = isSaturday(date) ? date : previousSaturday(date);

  return getUTCDate(currentSaturday);
};
