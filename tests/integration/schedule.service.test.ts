import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { Role } from "../../src/generated/prisma/client";
import { BadRequestError } from "@/core/errors/bad-request.error";
import { ForbiddenError } from "@/core/errors/forbidden.error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ScheduleService } from "@/core/service/schedule.service";
import { ScheduleItemService } from "@/core/service/scheduleItem.service";
import { createTestPrisma, resetDb } from "../helpers/testDb";
import { addMember, seedPlanContext, type PlanContext } from "../fixtures/schedule";

const prisma = createTestPrisma();
const schedules = new ScheduleService(prisma);
const items = new ScheduleItemService(prisma, schedules);
let ctx: PlanContext;

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

describe("ScheduleService.create / listMine", () => {
  it("creates a private plan owned by the user", async () => {
    const plan = await schedules.create(ctx.userId, {
      schedule_name: "Weekend",
      total_day: 2,
      categories: ["NATURE"],
    });

    expect(plan).toMatchObject({ owner_id: ctx.userId, is_public: false, total_day: 2 });
  });

  it("rejects invalid input and writes nothing", async () => {
    await expect(schedules.create(ctx.userId, { schedule_name: "" })).rejects.toBeInstanceOf(ZodError);
    await expect(prisma.schedule.count()).resolves.toBe(1);
  });

  it("lists owned plans and plans shared with the user, but not other plans", async () => {
    const shared = await schedules.create(ctx.otherUserId, {
      schedule_name: "Shared",
      total_day: 1,
      categories: ["CULTURE"],
    });
    await schedules.create(ctx.otherUserId, { schedule_name: "Private", total_day: 1, categories: ["CULTURE"] });
    await addMember(prisma, shared.schedule_id, ctx.userId, Role.VIEWER);

    const mine = await schedules.listMine(ctx.userId);

    expect(mine.map((plan) => plan.schedule_name).sort()).toEqual(["Northern trip", "Shared"]);
    expect(mine.find((plan) => plan.schedule_name === "Shared")?.is_owner).toBe(false);
  });
});

describe("ScheduleService.getForUser", () => {
  it("returns every day of the plan, including empty ones", async () => {
    await items.addToSchedule(ctx.scheduleId, ctx.userId, {
      location_id: ctx.locationId,
      day_no: 2,
      visit_time: "10:00",
    });

    const plan = await schedules.getForUser(ctx.scheduleId, ctx.userId);

    expect(plan.days.map((day) => day.stops.length)).toEqual([0, 1, 0]);
    expect(plan.days[1].stops[0].visit_time).toBe("10:00");
    expect(plan).toMatchObject({ access: "owner", can_edit: true });
  });

  it("hides a plan from someone who is not a member", async () => {
    await expect(schedules.getForUser(ctx.scheduleId, ctx.otherUserId)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("lets a viewer read but not edit", async () => {
    await addMember(prisma, ctx.scheduleId, ctx.otherUserId, Role.VIEWER);

    const plan = await schedules.getForUser(ctx.scheduleId, ctx.otherUserId);

    expect(plan).toMatchObject({ access: "viewer", can_edit: false });
    await expect(
      schedules.update(ctx.scheduleId, ctx.otherUserId, { schedule_name: "Changed" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});

describe("ScheduleService.update / delete", () => {
  it("lets an editor change the plan", async () => {
    await addMember(prisma, ctx.scheduleId, ctx.otherUserId, Role.EDITOR);

    const plan = await schedules.update(ctx.scheduleId, ctx.otherUserId, { is_public: true });

    expect(plan.is_public).toBe(true);
  });

  it("refuses to shorten a plan below a day that still has places", async () => {
    await items.addToSchedule(ctx.scheduleId, ctx.userId, {
      location_id: ctx.locationId,
      day_no: 3,
      visit_time: "09:00",
    });

    await expect(schedules.update(ctx.scheduleId, ctx.userId, { total_day: 2 })).rejects.toBeInstanceOf(
      BadRequestError,
    );
    await expect(schedules.update(ctx.scheduleId, ctx.userId, { total_day: 5 })).resolves.toMatchObject({
      total_day: 5,
    });
  });

  it("only lets the owner delete, and removes the items with it", async () => {
    await addMember(prisma, ctx.scheduleId, ctx.otherUserId, Role.EDITOR);
    await items.addToSchedule(ctx.scheduleId, ctx.userId, {
      location_id: ctx.locationId,
      day_no: 1,
      visit_time: "09:00",
    });

    await expect(schedules.delete(ctx.scheduleId, ctx.otherUserId)).rejects.toBeInstanceOf(ForbiddenError);
    await schedules.delete(ctx.scheduleId, ctx.userId);

    await expect(prisma.schedule.count()).resolves.toBe(0);
    await expect(prisma.scheduleItem.count()).resolves.toBe(0);
  });
});
