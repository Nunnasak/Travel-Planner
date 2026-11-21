import { z } from "zod";
import { CATEGORIES, idSchema } from "./discovery.schema";

export const MAX_DAYS = 30;

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().trim().max(max).nullable().optional(),
  );

export const createScheduleSchema = z.object({
  schedule_name: z
    .string({ error: "Enter a plan name." })
    .trim()
    .min(1, "Enter a plan name.")
    .max(100, "Keep the name under 100 characters."),
  description: optionalText(1000),
  total_day: z.coerce
    .number({ error: "Enter how many days." })
    .int()
    .min(1, "A plan needs at least 1 day.")
    .max(MAX_DAYS, `A plan can have at most ${MAX_DAYS} days.`),
  categories: z
    .array(z.enum(CATEGORIES, { error: "Pick a category from the list." }), {
      error: "Pick at least one category.",
    })
    .min(1, "Pick at least one category.")
    .transform((list) => [...new Set(list)]),
  cover_url: z.preprocess(
    (value) => (value === "" ? null : value),
    z.url({ error: "Enter a full image URL (https://...)." }).nullable().optional(),
  ),
  is_public: z.boolean().default(false),
});

export const updateScheduleSchema = createScheduleSchema
  .partial()
  .extend({ is_public: z.boolean().optional() });

export const reorderScheduleSchema = z.object({
  days: z
    .array(
      z.object({
        day_no: z.number().int().min(1).max(MAX_DAYS),
        item_ids: z.array(idSchema),
      }),
    )
    .min(1),
});

export type CreateScheduleInput = z.output<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.output<typeof updateScheduleSchema>;
export type ReorderScheduleInput = z.output<typeof reorderScheduleSchema>;
