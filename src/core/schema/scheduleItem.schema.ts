import { z } from "zod";

const TIME_OF_DAY = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const visitTimeSchema = z.union(
  [
    z
      .string()
      .regex(TIME_OF_DAY)
      .transform((time) => new Date(`1970-01-01T${time}Z`)),
    z.iso.datetime({ offset: true }).transform((value) => new Date(value)),
    z.date(),
  ],
  { error: "Enter a time like 09:30 or 09:30:00." },
);

export const createScheduleItemSchema = z.object({
  schedule_id: z.number().int().positive(),
  location_id: z.number().int().positive(),
  day_no: z.number().int().min(1),
  sequence_no: z.number().int().min(1),
  visit_time: visitTimeSchema,
});

export const updateScheduleItemSchema = createScheduleItemSchema.partial();
