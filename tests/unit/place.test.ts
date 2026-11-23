import { describe, expect, it } from "vitest";
import { emptyDayNumbers } from "@/core/domain/schedule";
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
