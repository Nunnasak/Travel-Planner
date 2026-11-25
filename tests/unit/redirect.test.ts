import { describe, expect, it } from "vitest";
import { safeNextPath, withNextPath } from "@/lib/redirect";

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

describe("withNextPath", () => {
  it("adds where to go back to", () => {
    expect(withNextPath("/register", "/discover/10")).toBe("/register?next=%2Fdiscover%2F10");
    expect(withNextPath("/login", "/schedules?q=trip")).toBe("/login?next=%2Fschedules%3Fq%3Dtrip");
  });

  it("keeps the link short when going back to the default page", () => {
    expect(withNextPath("/login", "/discover")).toBe("/login");
  });

  it("survives a round trip through safeNextPath", () => {
    const link = new URL(withNextPath("/register", "/discover/10"), "http://localhost");
    expect(safeNextPath(link.searchParams.get("next"))).toBe("/discover/10");
  });
});
