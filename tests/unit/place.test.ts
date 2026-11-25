import { describe, expect, it } from "vitest";
import { emptyDayNumbers, planVersion, unorderedDayNumbers } from "@/core/domain/schedule";
import { placeLine } from "@/lib/place";

const city = { city_name: "อำเภอเมืองเชียงใหม่", province: { province_name: "เชียงใหม่" } };

describe("placeLine", () => {
  it("shows the district and province when there is no address", () => {
    expect(placeLine({ address: null, city })).toBe("อำเภอเมืองเชียงใหม่, เชียงใหม่");
    expect(placeLine({ address: "  ", city })).toBe("อำเภอเมืองเชียงใหม่, เชียงใหม่");
  });

  it("adds the district and province after a short address", () => {
    expect(placeLine({ address: "ถ.นิมมานเหมินท์", city })).toBe("ถ.นิมมานเหมินท์ · อำเภอเมืองเชียงใหม่, เชียงใหม่");
  });

  it("does not repeat the district when the address already has it", () => {
    const address = "ตำบลสุเทพ อำเภอเมืองเชียงใหม่ เชียงใหม่";
    expect(placeLine({ address, city })).toBe(address);
  });
});

describe("emptyDayNumbers", () => {
  it("lists the days that have no places", () => {
    expect(emptyDayNumbers(4, [{ day_no: 1 }, { day_no: 3 }, { day_no: 3 }])).toEqual([2, 4]);
  });

  it("ignores places on days past the end of the plan", () => {
    expect(emptyDayNumbers(2, [{ day_no: 1 }, { day_no: 2 }, { day_no: 5 }])).toEqual([]);
  });
});

describe("unorderedDayNumbers", () => {
  it("finds the days where a place is earlier than the one before it", () => {
    const items = [
      { day_no: 1, visit_time: "10:31" },
      { day_no: 1, visit_time: "10:30" },
      { day_no: 2, visit_time: "08:00" },
      { day_no: 2, visit_time: "12:00" },
      { day_no: 3, visit_time: "18:00" },
      { day_no: 3, visit_time: "09:00" },
    ];
    expect(unorderedDayNumbers(items)).toEqual([1, 3]);
  });

  it("accepts places at the same time", () => {
    expect(unorderedDayNumbers([{ day_no: 1, visit_time: "09:00" }, { day_no: 1, visit_time: "09:00" }])).toEqual([]);
  });

  it("does not compare the last place of a day with the next day", () => {
    expect(unorderedDayNumbers([{ day_no: 1, visit_time: "20:00" }, { day_no: 2, visit_time: "07:00" }])).toEqual([]);
  });
});

describe("planVersion", () => {
  const base = {
    access: "owner",
    updated_at: new Date("2026-11-25T08:00:00Z"),
    post: null,
    member_count: 1,
    items: [{ item_id: 1, day_no: 1, sequence_no: 1, visit_time: "09:00", location_id: 7 }],
  };

  it("gives the same version for the same plan", () => {
    expect(planVersion(base)).toBe(planVersion({ ...base, items: [...base.items] }));
  });

  it.each([
    ["a time", { items: [{ ...base.items[0], visit_time: "09:30" }] }],
    ["the order", { items: [{ ...base.items[0], sequence_no: 2 }] }],
    ["a new place", { items: [...base.items, { item_id: 2, day_no: 1, sequence_no: 2, visit_time: "11:00", location_id: 8 }] }],
    ["the plan details", { updated_at: new Date("2026-11-25T08:00:01Z") }],
    ["the members", { member_count: 2 }],
    ["the viewer's access", { access: "viewer" }],
  ])("changes when %s changes", (_label, change) => {
    expect(planVersion({ ...base, ...change })).not.toBe(planVersion(base));
  });
});
