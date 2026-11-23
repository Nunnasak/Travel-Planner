import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Role } from "../../src/generated/prisma/client";
import { BadRequestError } from "@/core/errors/bad-request.error";
import { ForbiddenError } from "@/core/errors/forbidden.error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { DiscoveryService } from "@/core/service/discovery.service";
import { ScheduleService } from "@/core/service/schedule.service";
import { ScheduleItemService } from "@/core/service/scheduleItem.service";
import { createTestPrisma, resetDb } from "../helpers/testDb";
import { addMember, seedPlanContext, type PlanContext } from "../fixtures/schedule";

const prisma = createTestPrisma();
const schedules = new ScheduleService(prisma);
const items = new ScheduleItemService(prisma, schedules);
const discovery = new DiscoveryService(prisma);
let ctx: PlanContext;

async function add(locationIndex: number, dayNo: number, time = "09:00") {
  return items.addToSchedule(ctx.scheduleId, ctx.userId, {
    location_id: ctx.locationIds[locationIndex],
    day_no: dayNo,
    visit_time: time,
  });
}

async function setDays(total: number) {
  await schedules.update(ctx.scheduleId, ctx.userId, { total_day: total });
}

async function postStops(postId: number) {
  const post = await discovery.getPublic(postId);
  return post.days.flatMap((day) => day.stops.map((stop) => `${day.day_no}:${stop.location.name}`));
}

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await resetDb(prisma);
  ctx = await seedPlanContext(prisma);
  await setDays(1);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("ScheduleService.publish", () => {
  it("posts a public copy and keeps the plan itself private", async () => {
    await add(0, 1);

    const post = await schedules.publish(ctx.scheduleId, ctx.userId);

    expect(post.schedule_id).not.toBe(ctx.scheduleId);
    await expect(postStops(post.schedule_id)).resolves.toEqual(["1:Wat Phra That Doi Suthep"]);
    await expect(prisma.schedule.findUnique({ where: { schedule_id: ctx.scheduleId } })).resolves.toMatchObject({
      is_public: false,
    });
    await expect(schedules.getForUser(ctx.scheduleId, ctx.userId)).resolves.toMatchObject({
      post: { schedule_id: post.schedule_id },
    });
  });

  it("does not change the post when the plan changes later", async () => {
    await add(0, 1);
    const post = await schedules.publish(ctx.scheduleId, ctx.userId);

    await setDays(2);
    await add(1, 2);
    await schedules.update(ctx.scheduleId, ctx.userId, { schedule_name: "Changed later" });

    await expect(postStops(post.schedule_id)).resolves.toEqual(["1:Wat Phra That Doi Suthep"]);
    await expect(discovery.getPublic(post.schedule_id)).resolves.toMatchObject({ schedule_name: "Northern trip" });
  });

  it("updates the same post when posted again", async () => {
    await add(0, 1);
    const first = await schedules.publish(ctx.scheduleId, ctx.userId);
    await setDays(2);
    await add(1, 2);
    await schedules.update(ctx.scheduleId, ctx.userId, { schedule_name: "Changed later" });

    const second = await schedules.publish(ctx.scheduleId, ctx.userId);

    expect(second.schedule_id).toBe(first.schedule_id);
    await expect(postStops(second.schedule_id)).resolves.toEqual(["1:Wat Phra That Doi Suthep", "2:Wat Chedi Luang"]);
    await expect(discovery.getPublic(second.schedule_id)).resolves.toMatchObject({ schedule_name: "Changed later" });
    await expect(prisma.schedule.count({ where: { is_public: true } })).resolves.toBe(1);
  });

  it("keeps the post out of My Schedule and out of plan editing", async () => {
    await add(0, 1);
    const post = await schedules.publish(ctx.scheduleId, ctx.userId);

    const mine = await schedules.listMine(ctx.userId);
    expect(mine.map((plan) => plan.schedule_id)).toEqual([ctx.scheduleId]);
    expect(mine[0].post).toMatchObject({ schedule_id: post.schedule_id });
    await expect(schedules.getForUser(post.schedule_id, ctx.userId)).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      items.addToSchedule(post.schedule_id, ctx.userId, { location_id: ctx.locationId, day_no: 1, visit_time: "09:00" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("only lets the owner post or remove the post", async () => {
    await addMember(prisma, ctx.scheduleId, ctx.otherUserId, Role.EDITOR);
    await add(0, 1);
    await schedules.publish(ctx.scheduleId, ctx.userId);

    await expect(schedules.publish(ctx.scheduleId, ctx.otherUserId)).rejects.toBeInstanceOf(ForbiddenError);
    await expect(schedules.unpublish(ctx.scheduleId, ctx.otherUserId)).rejects.toBeInstanceOf(ForbiddenError);
  });
});

describe("ScheduleService.publish with empty days", () => {
  it("refuses to post while a day has no places", async () => {
    await setDays(3);
    await add(0, 1);

    const attempt = schedules.publish(ctx.scheduleId, ctx.userId);

    await expect(attempt).rejects.toBeInstanceOf(BadRequestError);
    await expect(attempt).rejects.toThrow("Add at least one place to day 2, 3 before posting.");
    await expect(prisma.schedule.count({ where: { is_public: true } })).resolves.toBe(0);
  });

  it("refuses to update an existing post once a day is empty", async () => {
    await add(0, 1);
    const post = await schedules.publish(ctx.scheduleId, ctx.userId);
    await setDays(2);

    await expect(schedules.publish(ctx.scheduleId, ctx.userId)).rejects.toBeInstanceOf(BadRequestError);
    await expect(postStops(post.schedule_id)).resolves.toEqual(["1:Wat Phra That Doi Suthep"]);
  });
});

describe("ScheduleService.publish with times out of order", () => {
  it("refuses to post while a place is earlier than the one before it", async () => {
    await add(0, 1, "10:31");
    const later = await add(1, 1, "10:30");

    await expect(schedules.publish(ctx.scheduleId, ctx.userId)).rejects.toThrow(
      "Put the places on day 1 in time order before posting.",
    );
    await expect(prisma.schedule.count({ where: { is_public: true } })).resolves.toBe(0);

    await items.editInSchedule(ctx.scheduleId, later.item_id, ctx.userId, { visit_time: "11:00" });
    await expect(schedules.publish(ctx.scheduleId, ctx.userId)).resolves.toMatchObject({
      schedule_id: expect.any(Number),
    });
  });
});

describe("ScheduleService.unpublish", () => {
  it("removes the post and leaves the plan", async () => {
    await add(0, 1);
    const post = await schedules.publish(ctx.scheduleId, ctx.userId);

    await schedules.unpublish(ctx.scheduleId, ctx.userId);

    await expect(discovery.getPublic(post.schedule_id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(prisma.scheduleItem.count({ where: { schedule_id: ctx.scheduleId } })).resolves.toBe(1);
    await expect(schedules.unpublish(ctx.scheduleId, ctx.userId)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("removes the post when the plan is deleted", async () => {
    await add(0, 1);
    await schedules.publish(ctx.scheduleId, ctx.userId);

    await schedules.delete(ctx.scheduleId, ctx.userId);

    await expect(prisma.schedule.count()).resolves.toBe(0);
  });
});
