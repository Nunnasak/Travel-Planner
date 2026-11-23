import { describe, expect, it } from "vitest";
import { parseTimeInput } from "@/lib/schedule";

describe("parseTimeInput", () => {
  it.each([
    ["09:30", "09:30"],
    ["9:30", "09:30"],
    ["930", "09:30"],
    ["0930", "09:30"],
    ["9.30", "09:30"],
    [" 18:05 ", "18:05"],
    ["00:00", "00:00"],
    ["23:59", "23:59"],
  ])("reads %j as %s", (raw, expected) => {
    expect(parseTimeInput(raw)).toBe(expected);
  });

  it.each(["", "24:00", "12:60", "9", "12345", "ab:cd", "9:3", "-1:00"])("rejects %j", (raw) => {
    expect(parseTimeInput(raw)).toBeNull();
  });
});
