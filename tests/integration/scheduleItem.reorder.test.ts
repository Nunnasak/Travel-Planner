import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { BadRequestError } from "@/core/errors/bad-request.error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ScheduleService } from "@/core/service/schedule.service";
import { ScheduleItemService } from "@/core/service/scheduleItem.service";
import { createTestPrisma, resetDb } from "../helpers/testDb";
import { seedPlanContext, type PlanContext } from "../fixtures/schedule";

const prisma = createTestPrisma();
const schedules = new ScheduleService(prisma);
const items = new ScheduleItemService(prisma, schedules);
let ctx: PlanContext;

async function add(locationIndex: number, dayNo: number) {
  return items.addToSchedule(ctx.scheduleId, ctx.userId, {
    location_id: ctx.locationIds[locationIndex],
    day_no: dayNo,
    visit_time: "09:00",
  });
}

async function layout() {
  const rows = await prisma.scheduleItem.findMany({
    where: { schedule_id: ctx.scheduleId },
    orderBy: [{ day_no: "asc" }, { sequence_no: "asc" }],
    select: { item_id: true, day_no: true, sequence_no: true },
  });
  return rows.map((row) => [row.day_no, row.sequence_no, row.item_id]);
}

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await resetDb(prisma);
  ctx = await seedPlanContext(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("ScheduleItemService.addToSchedule", () => {
  it("adds each place at the end of its day", async () => {
    const a = await add(0, 1);
    const b = await add(1, 1);
    const c = await add(2, 2);

    expect(await layout()).toEqual([
      [1, 1, a.item_id],
      [1, 2, b.item_id],
      [2, 1, c.item_id],
    ]);
  });

  it("rejects a day after the last day of the plan", async () => {
    await expect(add(0, 4)).rejects.toBeInstanceOf(BadRequestError);
  });

  it("rejects a place that does not exist", async () => {
    await expect(
      items.addToSchedule(ctx.scheduleId, ctx.userId, { location_id: 999999, day_no: 1, visit_time: "09:00" }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});

describe("ScheduleItemService.removeFromSchedule / editInSchedule", () => {
  it("renumbers the rest of the day after a removal", async () => {
    const a = await add(0, 1);
    const b = await add(1, 1);
    const c = await add(2, 1);

    await items.removeFromSchedule(ctx.scheduleId, b.item_id, ctx.userId);

    expect(await layout()).toEqual([
      [1, 1, a.item_id],
      [1, 2, c.item_id],
    ]);
  });

  it("moves a place to the end of another day and closes the gap", async () => {
    const a = await add(0, 1);
    const b = await add(1, 1);
    const c = await add(2, 2);

    await items.editInSchedule(ctx.scheduleId, a.item_id, ctx.userId, { day_no: 2, visit_time: "18:00" });

    expect(await layout()).toEqual([
      [1, 1, b.item_id],
      [2, 1, c.item_id],
      [2, 2, a.item_id],
    ]);
  });

  it("does not find an item through another plan's id", async () => {
    const a = await add(0, 1);
    const other = await schedules.create(ctx.userId, { schedule_name: "Other", total_day: 1, category: "NATURE" });

    await expect(items.removeFromSchedule(other.schedule_id, a.item_id, ctx.userId)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

describe("ScheduleItemService.reorder", () => {
  it("saves a new order within a day and across days in one go", async () => {
    const a = await add(0, 1);
    const b = await add(1, 1);
    const c = await add(2, 2);
    const d = await add(3, 2);

    await items.reorder(ctx.scheduleId, ctx.userId, {
      days: [
        { day_no: 1, item_ids: [d.item_id, a.item_id] },
        { day_no: 2, item_ids: [c.item_id] },
        { day_no: 3, item_ids: [b.item_id] },
      ],
    });

    expect(await layout()).toEqual([
      [1, 1, d.item_id],
      [1, 2, a.item_id],
      [2, 1, c.item_id],
      [3, 1, b.item_id],
    ]);
  });

  it("returns the plan grouped by day in the new order", async () => {
    const a = await add(0, 1);
    const b = await add(1, 1);

    const plan = await items.reorder(ctx.scheduleId, ctx.userId, {
      days: [{ day_no: 1, item_ids: [b.item_id, a.item_id] }],
    });

    expect(plan.days[0].stops.map((stop) => stop.item_id)).toEqual([b.item_id, a.item_id]);
  });

  it.each([
    ["leaves a place out", (ids: number[]) => [{ day_no: 1, item_ids: [ids[0]] }]],
    ["lists a place twice", (ids: number[]) => [{ day_no: 1, item_ids: [ids[0], ids[0], ids[1]] }]],
    ["uses a day after the last day", (ids: number[]) => [{ day_no: 9, item_ids: ids }]],
  ])("rejects an order that %s and changes nothing", async (_label, build) => {
    const a = await add(0, 1);
    const b = await add(1, 1);
    const before = await layout();

    await expect(
      items.reorder(ctx.scheduleId, ctx.userId, { days: build([a.item_id, b.item_id]) }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(await layout()).toEqual(before);
  });

  it("does not let someone outside the plan reorder it", async () => {
    const a = await add(0, 1);

    await expect(
      items.reorder(ctx.scheduleId, ctx.otherUserId, { days: [{ day_no: 1, item_ids: [a.item_id] }] }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
