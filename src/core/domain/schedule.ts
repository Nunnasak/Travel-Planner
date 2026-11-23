export function emptyDayNumbers(totalDays: number, items: { day_no: number }[]) {
  const filled = new Set(items.map((item) => item.day_no));
  return Array.from({ length: totalDays }, (_, index) => index + 1).filter((day) => !filled.has(day));
}

export function unorderedDayNumbers(items: { day_no: number; visit_time: string }[]) {
  const latest = new Map<number, string>();
  const unordered = new Set<number>();
  for (const item of items) {
    const previous = latest.get(item.day_no);
    if (previous !== undefined && item.visit_time < previous) unordered.add(item.day_no);
    latest.set(item.day_no, item.visit_time);
  }
  return [...unordered].sort((a, b) => a - b);
}
