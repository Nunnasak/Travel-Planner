import type { ScheduleService } from "@/core/service/schedule.service";
import type { ShareService } from "@/core/service/share.service";

export type MySchedule = Awaited<ReturnType<ScheduleService["listMine"]>>[number];
export type ScheduleDetail = Awaited<ReturnType<ScheduleService["getForUser"]>>;
export type ScheduleDay = ScheduleDetail["days"][number];
export type ScheduleStop = ScheduleDay["stops"][number];

export function formatVisitTime(value: string | null) {
  const match = value?.match(/(\d{1,2}):(\d{2})/);
  if (!match) return "--:--";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

export type Sharing = Awaited<ReturnType<ShareService["getSharing"]>>;
export type SharedPerson = Sharing["members"][number];
