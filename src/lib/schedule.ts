import type { ScheduleService } from "@/core/service/schedule.service";

export type MySchedule = Awaited<ReturnType<ScheduleService["listMine"]>>[number];
export type ScheduleDetail = Awaited<ReturnType<ScheduleService["getForUser"]>>;
export type ScheduleDay = ScheduleDetail["days"][number];
export type ScheduleStop = ScheduleDay["stops"][number];
