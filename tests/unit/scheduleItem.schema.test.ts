import { describe, expect, it } from "vitest";
import {
  createScheduleItemSchema,
  updateScheduleItemSchema,
} from "@/core/schema/scheduleItem.schema";

const valid = {
  schedule_id: 1,
  location_id: 2,
  day_no: 1,
  sequence_no: 1,
  visit_time: "1970-01-01T09:30:00.000Z",
};

describe("createScheduleItemSchema", () => {
  it("accepts valid input and coerces visit_time to a Date", () => {
    const parsed = createScheduleItemSchema.parse(valid);

    expect(parsed.visit_time).toBeInstanceOf(Date);
    expect(parsed.visit_time.toISOString()).toBe(valid.visit_time);
    expect(parsed).toMatchObject({ schedule_id: 1, location_id: 2, day_no: 1, sequence_no: 1 });
  });

  it.each([
    ["schedule_id", 0],
    ["schedule_id", -1],
    ["location_id", 0],
    ["day_no", 0],
    ["sequence_no", 0],
    ["day_no", 1.5],
    ["schedule_id", "1"],
  ])("rejects %s = %j", (field, value) => {
    const result = createScheduleItemSchema.safeParse({ ...valid, [field]: value });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual([field]);
  });

  it.each([
    ["09:30", "1970-01-01T09:30:00.000Z"],
    ["00:00", "1970-01-01T00:00:00.000Z"],
    ["23:59:59", "1970-01-01T23:59:59.000Z"],
  ])("accepts the time of day %j as visit_time", (input, expected) => {
    const parsed = createScheduleItemSchema.parse({ ...valid, visit_time: input });

    expect(parsed.visit_time.toISOString()).toBe(expected);
  });

  it("accepts a Date object as visit_time", () => {
    const date = new Date("1970-01-01T08:15:00.000Z");

    expect(createScheduleItemSchema.parse({ ...valid, visit_time: date }).visit_time).toEqual(date);
  });

  it.each([
    null,
    0,
    true,
    false,
    "",
    "9:30",
    "24:00",
    "09:60",
    "not a date",
    "2026-11-08T09:30",
    new Date("invalid"),
  ])("rejects %j as visit_time", (value) => {
    const result = createScheduleItemSchema.safeParse({ ...valid, visit_time: value });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["visit_time"]);
    expect(result.error?.issues[0]?.message).toBe("Enter a time like 09:30 or 09:30:00.");
  });

  it("rejects missing required fields", () => {
    const { location_id: _omit, ...rest } = valid;

    const result = createScheduleItemSchema.safeParse(rest);

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path)).toEqual([["location_id"]]);
  });
});

describe("updateScheduleItemSchema", () => {
  it("accepts an empty object", () => {
    expect(updateScheduleItemSchema.parse({})).toEqual({});
  });

  it("accepts a partial update", () => {
    expect(updateScheduleItemSchema.parse({ sequence_no: 3 })).toEqual({ sequence_no: 3 });
  });

  it("still validates the fields it is given", () => {
    expect(updateScheduleItemSchema.safeParse({ day_no: 0 }).success).toBe(false);
  });
});
