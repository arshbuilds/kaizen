export const getYearFromDate = (
  date: Date | string | number
): number | null => {
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d.getFullYear();
};
