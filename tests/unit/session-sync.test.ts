import { describe, expect, it } from "vitest";
import { sessionChanged } from "@/lib/session-sync";

const alice = { id: 1, name: "Alice", email: "alice@example.com" };

describe("sessionChanged", () => {
  it("is false when the same user is still logged in", () => {
    expect(sessionChanged(alice, { ...alice })).toBe(false);
  });

  it("is false when nobody was and nobody is logged in", () => {
    expect(sessionChanged(null, null)).toBe(false);
  });

  it("is true when the session was removed from another device", () => {
    expect(sessionChanged(alice, null)).toBe(true);
  });

  it("is true when someone logged in from another tab", () => {
    expect(sessionChanged(null, alice)).toBe(true);
  });

  it("is true when a different user is now logged in", () => {
    expect(sessionChanged(alice, { id: 2, name: "Bob", email: "bob@example.com" })).toBe(true);
  });

  it("is true when the name or email was changed elsewhere", () => {
    expect(sessionChanged(alice, { ...alice, name: "Alice B." })).toBe(true);
    expect(sessionChanged(alice, { ...alice, email: "new@example.com" })).toBe(true);
  });
});
