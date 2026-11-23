import { describe, expect, it } from "vitest";
import {
  createScheduleSchema,
  reorderScheduleSchema,
  updateScheduleSchema,
} from "@/core/schema/schedule.schema";
import { createLocationSchema } from "@/core/schema/location.schema";
import { addScheduleItemSchema, editScheduleItemSchema } from "@/core/schema/scheduleItem.schema";

const valid = { schedule_name: "Bangkok trip", total_day: 2, categories: ["CULTURE"] };

function issues(result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) {
  return result.error?.issues.map((issue) => String(issue.path[0])) ?? [];
}

describe("createScheduleSchema", () => {
  it("trims the name and turns empty optional fields into null", () => {
    const parsed = createScheduleSchema.parse({
      ...valid,
      schedule_name: "  Bangkok trip  ",
      description: "",
      cover_url: "",
    });

    expect(parsed).toEqual({
      schedule_name: "Bangkok trip",
      total_day: 2,
      categories: ["CULTURE"],
      description: null,
      cover_url: null,
    });
  });

  it("keeps several categories and drops repeats", () => {
    expect(createScheduleSchema.parse({ ...valid, categories: ["NATURE", "CULTURE", "NATURE"] }).categories).toEqual([
      "NATURE",
      "CULTURE",
    ]);
  });

  it("accepts total_day sent as a string from a form", () => {
    expect(createScheduleSchema.parse({ ...valid, total_day: "3" }).total_day).toBe(3);
  });

  it.each([
    ["schedule_name", { schedule_name: "   " }],
    ["schedule_name", { schedule_name: "x".repeat(101) }],
    ["total_day", { total_day: 0 }],
    ["total_day", { total_day: 31 }],
    ["total_day", { total_day: 1.5 }],
    ["categories", { categories: [] }],
    ["categories", { categories: ["BEACH"] }],
    ["categories", { categories: "CULTURE" }],
    ["cover_url", { cover_url: "not a url" }],
  ])("rejects a bad %s", (field, override) => {
    const result = createScheduleSchema.safeParse({ ...valid, ...override });
    expect(result.success).toBe(false);
    expect(issues(result)).toContain(field);
  });
});

describe("updateScheduleSchema", () => {
  it("keeps only the fields that were sent", () => {
    expect(updateScheduleSchema.parse({ schedule_name: "New name" })).toEqual({
      schedule_name: "New name",
    });
  });

  it("ignores is_public because posting to Discover has its own endpoint", () => {
    expect(updateScheduleSchema.parse({ total_day: 4, is_public: true })).toEqual({ total_day: 4 });
  });

  it("still validates the fields it gets", () => {
    expect(updateScheduleSchema.safeParse({ total_day: 0 }).success).toBe(false);
  });
});

describe("reorderScheduleSchema", () => {
  it("accepts the full order of every day", () => {
    const input = { days: [{ day_no: 1, item_ids: [3, 1] }, { day_no: 2, item_ids: [] }] };
    expect(reorderScheduleSchema.parse(input)).toEqual(input);
  });

  it.each([
    ["no days", { days: [] }],
    ["day 0", { days: [{ day_no: 0, item_ids: [] }] }],
    ["a non-numeric id", { days: [{ day_no: 1, item_ids: ["abc"] }] }],
    ["a negative id", { days: [{ day_no: 1, item_ids: [-1] }] }],
  ])("rejects %s", (_label, input) => {
    expect(reorderScheduleSchema.safeParse(input).success).toBe(false);
  });
});

describe("addScheduleItemSchema / editScheduleItemSchema", () => {
  it("turns a time like 14:30 into a TIME value", () => {
    const parsed = addScheduleItemSchema.parse({ location_id: 1, day_no: 1, visit_time: "14:30" });
    expect(parsed.visit_time.toISOString()).toBe("1970-01-01T14:30:00.000Z");
  });

  it("requires a place, a day and a time when adding", () => {
    const result = addScheduleItemSchema.safeParse({});
    expect(issues(result)).toEqual(expect.arrayContaining(["location_id", "day_no", "visit_time"]));
  });

  it("allows changing only the time when editing", () => {
    const parsed = editScheduleItemSchema.parse({ visit_time: "08:00" });
    expect(parsed).not.toHaveProperty("day_no");
  });
});

describe("createLocationSchema", () => {
  it("accepts a new place without an image", () => {
    const parsed = createLocationSchema.parse({ name: " Cafe ", address: "1 Road", city_id: 4, image_url: "" });
    expect(parsed).toEqual({ name: "Cafe", address: "1 Road", city_id: 4, image_url: null });
  });

  it.each([undefined, "", "   "])("treats an address of %j as no address", (address) => {
    const parsed = createLocationSchema.parse({ name: "Cafe", address, city_id: 4 });
    expect(parsed.address).toBeNull();
  });

  it.each([
    ["name", { name: "" }],
    ["address", { address: "x".repeat(301) }],
    ["city_id", { city_id: 0 }],
    ["image_url", { image_url: "ftp//x" }],
  ])("rejects a bad %s", (field, override) => {
    const result = createLocationSchema.safeParse({ name: "Cafe", address: "1 Road", city_id: 4, ...override });
    expect(issues(result)).toContain(field);
  });
});
