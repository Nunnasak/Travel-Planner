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

  it("rejects an invalid visit_time", () => {
    expect(createScheduleItemSchema.safeParse({ ...valid, visit_time: "not a date" }).success).toBe(
      false,
    );
  });

  it("rejects missing required fields", () => {
    const { location_id: _omit, ...rest } = valid;

    expect(createScheduleItemSchema.safeParse(rest).success).toBe(false);
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
