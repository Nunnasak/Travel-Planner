import { Category, PrismaClient } from "../../src/generated/prisma/client";

export type ScheduleContext = {
  userId: number;
  scheduleId: number;
  locationId: number;
};

/** Seeds the rows a ScheduleItem depends on: Province → City → Location and User → Schedule. */
export async function seedScheduleContext(prisma: PrismaClient): Promise<ScheduleContext> {
  const province = await prisma.province.create({ data: { province_name: "Chiang Mai" } });
  const city = await prisma.city.create({
    data: { city_name: "Mueang Chiang Mai", province_id: province.province_id },
  });
  const location = await prisma.location.create({
    data: { name: "Wat Phra That Doi Suthep", address: "Suthep, Mueang", city_id: city.city_id },
  });
  const user = await prisma.user.create({
    data: { username: "tester", email: "tester@example.test", password_hash: "not-a-real-hash" },
  });
  const schedule = await prisma.schedule.create({
    data: {
      schedule_name: "Northern trip",
      total_day: 3,
      category: Category.CULTURE,
      owner_id: user.user_id,
    },
  });

  return {
    userId: user.user_id,
    scheduleId: schedule.schedule_id,
    locationId: location.location_id,
  };
}

export function validItemInput(ctx: ScheduleContext, overrides: Record<string, unknown> = {}) {
  return {
    schedule_id: ctx.scheduleId,
    location_id: ctx.locationId,
    day_no: 1,
    sequence_no: 1,
    visit_time: "1970-01-01T09:30:00.000Z",
    ...overrides,
  };
}
