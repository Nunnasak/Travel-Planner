import { z } from "zod";

export const UPLOAD_PATH = "/api/uploads/";
export const UPLOAD_NAME_PATTERN = /^[0-9a-f]{32}\.webp$/;

const uploadedPath = z
  .string()
  .refine(
    (value) => value.startsWith(UPLOAD_PATH) && UPLOAD_NAME_PATTERN.test(value.slice(UPLOAD_PATH.length)),
    "Enter a full image URL (https://...) or upload a photo.",
  );

export const imageUrlSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z
    .union([z.url(), uploadedPath], { error: "Enter a full image URL (https://...) or upload a photo." })
    .nullable()
    .optional(),
);
