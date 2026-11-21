import { describe, expect, it } from "vitest";
import { addMemberSchema, linkAccessSchema, updateMemberSchema } from "@/core/schema/share.schema";

describe("addMemberSchema", () => {
  it("trims the username or email", () => {
    expect(addMemberSchema.parse({ identifier: "  friend@example.com ", role: "EDITOR" })).toEqual({
      identifier: "friend@example.com",
      role: "EDITOR",
    });
  });

  it.each([
    ["an empty identifier", { identifier: "   ", role: "VIEWER" }],
    ["a missing identifier", { role: "VIEWER" }],
    ["a very long identifier", { identifier: "x".repeat(255), role: "VIEWER" }],
    ["the owner role", { identifier: "friend", role: "OWNER" }],
    ["a lower-case role", { identifier: "friend", role: "viewer" }],
  ])("rejects %s", (_label, input) => {
    expect(addMemberSchema.safeParse(input).success).toBe(false);
  });
});

describe("updateMemberSchema", () => {
  it("accepts viewer and editor only", () => {
    expect(updateMemberSchema.safeParse({ role: "VIEWER" }).success).toBe(true);
    expect(updateMemberSchema.safeParse({ role: "EDITOR" }).success).toBe(true);
    expect(updateMemberSchema.safeParse({ role: "RESTRICTED" }).success).toBe(false);
  });
});

describe("linkAccessSchema", () => {
  it.each(["RESTRICTED", "VIEWER", "EDITOR"])("accepts %s", (value) => {
    expect(linkAccessSchema.parse({ link_access: value })).toEqual({ link_access: value });
  });

  it("rejects anything else", () => {
    expect(linkAccessSchema.safeParse({ link_access: "PUBLIC" }).success).toBe(false);
    expect(linkAccessSchema.safeParse({}).success).toBe(false);
  });
});
