export function emptyDayNumbers(totalDays: number, items: { day_no: number }[]) {
  const filled = new Set(items.map((item) => item.day_no));
  return Array.from({ length: totalDays }, (_, index) => index + 1).filter((day) => !filled.has(day));
}
