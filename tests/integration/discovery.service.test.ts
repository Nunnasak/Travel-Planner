import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { NotFoundError } from "@/core/errors/not-found.error";
import { DiscoveryService } from "@/core/service/discovery.service";
import { createTestPrisma, resetDb } from "../helpers/testDb";
import { seedDiscoveryContext, type DiscoveryContext } from "../fixtures/discovery";

const prisma = createTestPrisma();
const service = new DiscoveryService(prisma);
let ctx: DiscoveryContext;

async function listIds(input: Record<string, unknown> = {}) {
  const result = await service.list(input);
  return result.items.map((item) => item.schedule_id);
}

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await resetDb(prisma);
  ctx = await seedDiscoveryContext(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("DiscoveryService.list", () => {
  it("returns only public plans, newest first", async () => {
    const { plans } = ctx;

    const result = await service.list({});

    expect(result.items.map((item) => item.schedule_id)).toEqual([
      plans.longTrip,
      plans.northern,
      plans.temples,
    ]);
    expect(result).toMatchObject({ page: 1, page_size: 12, total: 3, total_pages: 1 });
  });

  it("never returns a private plan, even when the search matches it", async () => {
    await expect(listIds({ q: "secret" })).resolves.toEqual([]);
    await expect(listIds({ q: "Private" })).resolves.toEqual([]);
  });

  it("filters by category", async () => {
    await expect(listIds({ category: "NATURE" })).resolves.toEqual([
      ctx.plans.longTrip,
      ctx.plans.northern,
    ]);
  });

  it("matches a plan that has any of the picked categories", async () => {
    await expect(listIds({ category: "CULTURE" })).resolves.toEqual([ctx.plans.northern, ctx.plans.temples]);
    await expect(listIds({ category: "CULTURE,NATURE" })).resolves.toEqual([
      ctx.plans.longTrip,
      ctx.plans.northern,
      ctx.plans.temples,
    ]);
  });

  it("filters by district through any stop of the plan", async () => {
    await expect(listIds({ city_id: String(ctx.phraNakhonId) })).resolves.toEqual([
      ctx.plans.northern,
      ctx.plans.temples,
    ]);
  });

  it("matches days 1-3 exactly", async () => {
    await expect(listIds({ days: "1" })).resolves.toEqual([ctx.plans.temples]);
    await expect(listIds({ days: "2" })).resolves.toEqual([]);
  });

  it("treats days = 4 as four days or more", async () => {
    await expect(listIds({ days: "4" })).resolves.toEqual([ctx.plans.longTrip, ctx.plans.northern]);
  });

  it("filters by province through any stop of the plan", async () => {
    await expect(listIds({ province_id: String(ctx.chiangMaiId) })).resolves.toEqual([
      ctx.plans.longTrip,
      ctx.plans.northern,
    ]);
    await expect(listIds({ province_id: String(ctx.bangkokId) })).resolves.toEqual([
      ctx.plans.northern,
      ctx.plans.temples,
    ]);
  });

  it("searches plan names case-insensitively", async () => {
    await expect(listIds({ q: "bangkok TEMPLES" })).resolves.toEqual([ctx.plans.temples]);
  });

  it("searches descriptions case-insensitively", async () => {
    await expect(listIds({ q: "MOUNTAINS" })).resolves.toEqual([ctx.plans.northern]);
  });

  it("searches place names", async () => {
    await expect(listIds({ q: "wat pho" })).resolves.toEqual([ctx.plans.northern, ctx.plans.temples]);
  });

  it("combines search and filters with AND", async () => {
    await expect(listIds({ q: "wat pho", province_id: String(ctx.chiangMaiId) })).resolves.toEqual([
      ctx.plans.northern,
    ]);
  });

  it("pages through results", async () => {
    const first = await service.list({ page: "1", page_size: "2" });
    const second = await service.list({ page: "2", page_size: "2" });
    const past = await service.list({ page: "3", page_size: "2" });

    expect(first.items.map((item) => item.schedule_id)).toEqual([ctx.plans.longTrip, ctx.plans.northern]);
    expect(second.items.map((item) => item.schedule_id)).toEqual([ctx.plans.temples]);
    expect(past.items).toEqual([]);
    expect(first).toMatchObject({ total: 3, total_pages: 2 });
  });

  it("reports one page when nothing matches", async () => {
    await expect(service.list({ q: "nothing matches this" })).resolves.toMatchObject({
      items: [],
      total: 0,
      total_pages: 1,
    });
  });

  it("builds card fields from the plan's stops", async () => {
    const { items } = await service.list({});
    const card = (id: number) => items.find((item) => item.schedule_id === id);

    expect(card(ctx.plans.northern)).toMatchObject({
      schedule_name: "Northern escape",
      total_day: 4,
      categories: ["NATURE", "CULTURE"],
      provinces: ["Bangkok", "Chiang Mai"],
      place_count: 2,
      cover_url: "https://img.test/wat-pho.jpg",
      owner: { username: "planner" },
    });
    expect(card(ctx.plans.temples)).toMatchObject({ provinces: ["Bangkok"], place_count: 2 });
    expect(card(ctx.plans.longTrip)?.cover_url).toBe("https://img.test/long-trip-cover.jpg");
  });

  it("throws a ZodError for an invalid query", async () => {
    await expect(service.list({ days: "5" })).rejects.toBeInstanceOf(ZodError);
    await expect(service.list({ province_id: "99999999999" })).rejects.toBeInstanceOf(ZodError);
  });
});

describe("DiscoveryService.getPublic", () => {
  it("returns a public plan with its stops grouped by day in order", async () => {
    const plan = await service.getPublic(ctx.plans.northern);

    expect(plan).toMatchObject({ schedule_id: ctx.plans.northern, schedule_name: "Northern escape" });
    expect(plan).not.toHaveProperty("items");
    expect(
      plan.days.map((day) => ({
        day_no: day.day_no,
        stops: day.stops.map((stop) => [stop.sequence_no, stop.visit_time, stop.location.name]),
      })),
    ).toEqual([
      { day_no: 1, stops: [[1, "10:00", "Wat Pho"]] },
      { day_no: 2, stops: [[1, "08:00", "Doi Suthep"]] },
    ]);
    expect(plan.days[1]?.stops[0]?.location.city.province.province_name).toBe("Chiang Mai");
  });

  it("orders stops within a day by sequence_no", async () => {
    const plan = await service.getPublic(ctx.plans.temples);

    expect(plan.days).toHaveLength(1);
    expect(plan.days[0]?.stops.map((stop) => stop.location.name)).toEqual(["Grand Palace", "Wat Pho"]);
  });

  it("throws NotFoundError for a private plan", async () => {
    await expect(service.getPublic(ctx.plans.secret)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws NotFoundError for a plan that does not exist", async () => {
    await expect(service.getPublic(ctx.plans.secret + 999)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("DiscoveryService.listProvinces", () => {
  it("returns every province sorted by name", async () => {
    await expect(service.listProvinces()).resolves.toEqual([
      { province_id: ctx.bangkokId, province_name: "Bangkok" },
      { province_id: ctx.chiangMaiId, province_name: "Chiang Mai" },
    ]);
  });
});
