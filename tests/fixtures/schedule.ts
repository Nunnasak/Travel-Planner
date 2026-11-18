import { PrismaClient, Role } from "../../src/generated/prisma/client";
import { seedScheduleContext, type ScheduleContext } from "./scheduleItem";

export type PlanContext = ScheduleContext & {
  otherUserId: number;
  locationIds: number[];
  cityId: number;
};

export async function seedPlanContext(prisma: PrismaClient): Promise<PlanContext> {
  const base = await seedScheduleContext(prisma);
  const { city_id: cityId } = await prisma.location.findUniqueOrThrow({
    where: { location_id: base.locationId },
    select: { city_id: true },
  });
  const more = [];
  for (const name of ["Wat Chedi Luang", "Nimman Road", "Doi Inthanon"]) {
    more.push(await prisma.location.create({ data: { name, address: "Chiang Mai", city_id: cityId } }));
  }
  const other = await prisma.user.create({
    data: { username: "other", email: "other@example.test", password_hash: "not-a-real-hash" },
  });

  return {
    ...base,
    cityId,
    otherUserId: other.user_id,
    locationIds: [base.locationId, ...more.map((location) => location.location_id)],
  };
}

export async function addMember(
  prisma: PrismaClient,
  scheduleId: number,
  userId: number,
  role: Role,
) {
  await prisma.scheduleMember.create({ data: { schedule_id: scheduleId, user_id: userId, role } });
}
