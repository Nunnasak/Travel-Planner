import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { Prisma } from "../../src/generated/prisma/client";
import { ScheduleItemService } from "@/core/service/scheduleItem.service";
import { createTestPrisma, resetDb } from "../helpers/testDb";
import { seedScheduleContext, validItemInput, type ScheduleContext } from "../fixtures/scheduleItem";

const prisma = createTestPrisma();
const service = new ScheduleItemService(prisma);
let ctx: ScheduleContext;

function prismaCode(error: unknown): string | undefined {
  return error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
}

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await resetDb(prisma);
  ctx = await seedScheduleContext(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("ScheduleItemService.create", () => {
  it("stores and returns the new item", async () => {
    const item = await service.create(validItemInput(ctx));

    expect(item).toMatchObject({
      schedule_id: ctx.scheduleId,
      location_id: ctx.locationId,
      day_no: 1,
      sequence_no: 1,
    });
    expect(item.visit_time.toISOString()).toBe("1970-01-01T09:30:00.000Z");
    await expect(prisma.scheduleItem.count()).resolves.toBe(1);
  });

  it("stores a time-of-day visit_time and reads it back unchanged", async () => {
    const item = await service.create(validItemInput(ctx, { visit_time: "14:45:30" }));

    const stored = await prisma.scheduleItem.findUniqueOrThrow({ where: { item_id: item.item_id } });

    expect(stored.visit_time.toISOString()).toBe("1970-01-01T14:45:30.000Z");
  });

  it("rejects a null visit_time instead of storing midnight", async () => {
    await expect(
      service.create(validItemInput(ctx, { visit_time: null })),
    ).rejects.toBeInstanceOf(ZodError);
    await expect(prisma.scheduleItem.count()).resolves.toBe(0);
  });

  it("throws a ZodError for invalid input and writes nothing", async () => {
    await expect(service.create(validItemInput(ctx, { day_no: 0 }))).rejects.toBeInstanceOf(
      ZodError,
    );
    await expect(prisma.scheduleItem.count()).resolves.toBe(0);
  });

  it("rejects a duplicate schedule/day/sequence slot", async () => {
    await service.create(validItemInput(ctx));

    const error = await service.create(validItemInput(ctx)).catch((e: unknown) => e);

    expect(prismaCode(error)).toBe("P2002");
    await expect(prisma.scheduleItem.count()).resolves.toBe(1);
  });

  it("allows the same sequence number on a different day", async () => {
    await service.create(validItemInput(ctx));
    await service.create(validItemInput(ctx, { day_no: 2 }));

    await expect(prisma.scheduleItem.count()).resolves.toBe(2);
  });

  it("rejects a location that does not exist", async () => {
    const error = await service
      .create(validItemInput(ctx, { location_id: ctx.locationId + 999 }))
      .catch((e: unknown) => e);

    expect(prismaCode(error)).toBe("P2003");
  });
});

describe("ScheduleItemService.update", () => {
  it("changes only the given fields", async () => {
    const created = await service.create(validItemInput(ctx));

    const updated = await service.update(created.item_id, { sequence_no: 5 });

    expect(updated).toMatchObject({
      item_id: created.item_id,
      sequence_no: 5,
      day_no: created.day_no,
      location_id: created.location_id,
    });
    expect(updated.visit_time.toISOString()).toBe(created.visit_time.toISOString());
  });

  it("throws a ZodError for invalid input and leaves the row unchanged", async () => {
    const created = await service.create(validItemInput(ctx));

    await expect(service.update(created.item_id, { sequence_no: 0 })).rejects.toBeInstanceOf(
      ZodError,
    );
    await expect(
      prisma.scheduleItem.findUniqueOrThrow({ where: { item_id: created.item_id } }),
    ).resolves.toMatchObject({ sequence_no: 1 });
  });

  it("rejects moving an item into a slot that is already taken", async () => {
    await service.create(validItemInput(ctx));
    const second = await service.create(validItemInput(ctx, { sequence_no: 2 }));

    const error = await service.update(second.item_id, { sequence_no: 1 }).catch((e: unknown) => e);

    expect(prismaCode(error)).toBe("P2002");
    await expect(
      prisma.scheduleItem.findUniqueOrThrow({ where: { item_id: second.item_id } }),
    ).resolves.toMatchObject({ sequence_no: 2 });
  });

  it("rejects an item that does not exist", async () => {
    const error = await service.update(999_999, { sequence_no: 2 }).catch((e: unknown) => e);

    expect(prismaCode(error)).toBe("P2025");
  });
});
