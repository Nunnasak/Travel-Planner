import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/redirect";

describe("safeNextPath", () => {
  it("keeps a path inside the site", () => {
    expect(safeNextPath("/discover/12")).toBe("/discover/12");
    expect(safeNextPath("/schedules?q=trip")).toBe("/schedules?q=trip");
  });

  it.each([
    ["missing", undefined],
    ["an array", ["/a", "/b"]],
    ["another site", "https://evil.example"],
    ["a protocol-relative url", "//evil.example"],
    ["a backslash trick", "/\\evil.example"],
    ["a relative path", "discover"],
  ])("falls back to /discover for %s", (_label, value) => {
    expect(safeNextPath(value)).toBe("/discover");
  });
});
