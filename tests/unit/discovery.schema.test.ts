import { describe, expect, it } from "vitest";
import { discoveryQuerySchema, idSchema } from "@/core/schema/discovery.schema";

const ID_MESSAGE = "Must be a whole number from 1 to 2147483647.";

describe("idSchema", () => {
  it.each([
    ["1", 1],
    ["42", 42],
    ["2147483647", 2147483647],
    [7, 7],
  ])("accepts %j", (input, expected) => {
    expect(idSchema.parse(input)).toBe(expected);
  });

  it.each(["0", "-1", "1.5", "1e1", "0x10", " 5", "abc", "", "2147483648", "99999999999", 0, 1.5])(
    "rejects %j",
    (input) => {
      const result = idSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe(ID_MESSAGE);
    },
  );
});

describe("discoveryQuerySchema", () => {
  it("uses page 1 and page_size 12 when nothing is given", () => {
    expect(discoveryQuerySchema.parse({})).toEqual({ page: 1, page_size: 12 });
  });

  it("treats empty strings from an empty search box or filter as not set", () => {
    expect(
      discoveryQuerySchema.parse({ q: "", province_id: "", category: "", days: "", page: "", page_size: "" }),
    ).toEqual({ page: 1, page_size: 12 });
  });

  it("parses every filter from query-string values", () => {
    expect(
      discoveryQuerySchema.parse({
        q: "  temple  ",
        province_id: "3",
        category: "CULTURE",
        days: "2",
        page: "2",
        page_size: "20",
      }),
    ).toEqual({ q: "temple", province_id: 3, category: "CULTURE", days: 2, page: 2, page_size: 20 });
  });

  it.each(["1", "2", "3", "4"])("accepts days = %s", (days) => {
    expect(discoveryQuerySchema.parse({ days }).days).toBe(Number(days));
  });

  it.each([
    ["days", "0"],
    ["days", "5"],
    ["days", "30"],
    ["days", "1.5"],
    ["province_id", "1e1"],
    ["province_id", "99999999999"],
    ["category", "culture"],
    ["category", "UNKNOWN"],
    ["page", "0"],
    ["page", "10001"],
    ["page", "9007199254740991"],
    ["page_size", "0"],
    ["page_size", "51"],
    ["q", "x".repeat(101)],
  ])("rejects %s = %j", (field, value) => {
    const result = discoveryQuerySchema.safeParse({ [field]: value });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual([field]);
  });
});
