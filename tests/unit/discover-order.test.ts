import { describe, expect, it } from "vitest";
import { dailySeed, orderForDiscover } from "@/core/domain/discover-order";

const plans = Array.from({ length: 20 }, (_, index) => ({
  schedule_id: index + 1,
  has_cover: index % 3 !== 0,
}));

const idsOf = (list: { schedule_id: number }[]) => list.map((plan) => plan.schedule_id);

describe("dailySeed", () => {
  it("uses the date in Thailand", () => {
    expect(dailySeed(new Date("2026-11-24T10:00:00Z"))).toBe("2026-11-24");
    expect(dailySeed(new Date("2026-11-24T18:00:00Z"))).toBe("2026-11-25");
  });
});

describe("orderForDiscover", () => {
  it("puts every plan with a cover before the plans without one", () => {
    const ordered = orderForDiscover(plans, "2026-11-24");
    const firstWithout = ordered.findIndex((plan) => !plan.has_cover);

    expect(ordered.slice(firstWithout).every((plan) => !plan.has_cover)).toBe(true);
    expect(ordered.slice(0, firstWithout).every((plan) => plan.has_cover)).toBe(true);
  });

  it("keeps every plan exactly once", () => {
    expect(idsOf(orderForDiscover(plans, "2026-11-24")).sort((a, b) => a - b)).toEqual(idsOf(plans));
  });

  it("gives the same order for the same seed, whatever the input order", () => {
    const shuffled = [...plans].reverse();
    expect(idsOf(orderForDiscover(shuffled, "2026-11-24"))).toEqual(idsOf(orderForDiscover(plans, "2026-11-24")));
  });

  it("gives a different order on another day", () => {
    expect(idsOf(orderForDiscover(plans, "2026-11-25"))).not.toEqual(idsOf(orderForDiscover(plans, "2026-11-24")));
  });

  it.each(["2026-11-24", "2026-11-25", "2026-12-01"])("mixes neighbouring ids well on %s", (seed) => {
    const many = Array.from({ length: 200 }, (_, index) => ({ schedule_id: index + 1, has_cover: true }));
    const ordered = idsOf(orderForDiscover(many, seed));
    const rising = ordered.slice(1).filter((id, index) => id > ordered[index]).length;

    expect(rising).toBeGreaterThan(70);
    expect(rising).toBeLessThan(130);
  });
});
