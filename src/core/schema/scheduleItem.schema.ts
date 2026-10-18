import { z } from "zod";

export const createScheduleItemSchema = z.object({
  schedule_id: z.number().int().positive(),
  location_id: z.number().int().positive(),
  day_no: z.number().int().min(1),
  sequence_no: z.number().int().min(1),
  visit_time: z.coerce.date(),
});

export const updateScheduleItemSchema = createScheduleItemSchema.partial();