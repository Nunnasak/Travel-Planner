import { z } from "zod";
import { idSchema } from "./discovery.schema";

export const locationSearchSchema = z.object({
  q: z.preprocess(
    (value) => (value === null ? undefined : value),
    z.string().trim().max(100).default(""),
  ),
});

export const createLocationSchema = z.object({
  name: z
    .string({ error: "Enter the place name." })
    .trim()
    .min(1, "Enter the place name.")
    .max(150, "Keep the name under 150 characters."),
  address: z
    .string({ error: "Enter the address." })
    .trim()
    .min(1, "Enter the address.")
    .max(300, "Keep the address under 300 characters."),
  city_id: idSchema,
  image_url: z.preprocess(
    (value) => (value === "" ? null : value),
    z.url({ error: "Enter a full image URL (https://...)." }).nullable().optional(),
  ),
});
