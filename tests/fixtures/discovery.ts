import { Category, PrismaClient } from "../../src/generated/prisma/client";

export type DiscoveryContext = {
  bangkokId: number;
  chiangMaiId: number;
  plans: {
    // public, 1 day, CULTURE, Bangkok only
    temples: number;
    // public, 4 days, NATURE, Bangkok then Chiang Mai, items inserted out of order
    northern: number;
    // public, 7 days, NATURE, Chiang Mai, has its own cover_url
    longTrip: number;
    // PRIVATE, 1 day, CULTURE, Bangkok
    secret: number;
  };
};

const time = (hhmm: string) => new Date(`1970-01-01T${hhmm}:00Z`);

export async function seedDiscoveryContext(prisma: PrismaClient): Promise<DiscoveryContext> {
  const bangkok = await prisma.province.create({ data: { province_name: "Bangkok" } });
  const chiangMai = await prisma.province.create({ data: { province_name: "Chiang Mai" } });
  const phraNakhon = await prisma.city.create({
    data: { city_name: "Phra Nakhon", province_id: bangkok.province_id },
  });
  const mueangCm = await prisma.city.create({
    data: { city_name: "Mueang Chiang Mai", province_id: chiangMai.province_id },
  });

  const grandPalace = await prisma.location.create({
    data: { name: "Grand Palace", address: "Na Phra Lan Rd", city_id: phraNakhon.city_id },
  });
  const watPho = await prisma.location.create({
    data: {
      name: "Wat Pho",
      address: "Sanam Chai Rd",
      city_id: phraNakhon.city_id,
      image_url: "https://img.test/wat-pho.jpg",
    },
  });
  const doiSuthep = await prisma.location.create({
    data: { name: "Doi Suthep", address: "Huay Kaew Rd", city_id: mueangCm.city_id },
  });

  const owner = await prisma.user.create({
    data: { username: "planner", email: "planner@example.test", password_hash: "not-a-real-hash" },
  });

  const temples = await prisma.schedule.create({
    data: {
      schedule_name: "Bangkok temples",
      description: "A day around the old town",
      total_day: 1,
      category: Category.CULTURE,
      is_public: true,
      owner_id: owner.user_id,
      created_at: new Date("2026-01-01T00:00:00Z"),
      items: {
        create: [
          { day_no: 1, sequence_no: 1, visit_time: time("09:00"), location_id: grandPalace.location_id },
          { day_no: 1, sequence_no: 2, visit_time: time("11:30"), location_id: watPho.location_id },
        ],
      },
    },
  });

  const northern = await prisma.schedule.create({
    data: {
      schedule_name: "Northern escape",
      description: "Mountains and old temples",
      total_day: 4,
      category: Category.NATURE,
      is_public: true,
      owner_id: owner.user_id,
      created_at: new Date("2026-01-02T00:00:00Z"),
      items: {
        create: [
          { day_no: 2, sequence_no: 1, visit_time: time("08:00"), location_id: doiSuthep.location_id },
          { day_no: 1, sequence_no: 1, visit_time: time("10:00"), location_id: watPho.location_id },
        ],
      },
    },
  });

  const longTrip = await prisma.schedule.create({
    data: {
      schedule_name: "Long trip",
      total_day: 7,
      category: Category.NATURE,
      cover_url: "https://img.test/long-trip-cover.jpg",
      is_public: true,
      owner_id: owner.user_id,
      created_at: new Date("2026-01-03T00:00:00Z"),
      items: {
        create: [
          { day_no: 1, sequence_no: 1, visit_time: time("07:00"), location_id: doiSuthep.location_id },
        ],
      },
    },
  });

  const secret = await prisma.schedule.create({
    data: {
      schedule_name: "Secret plan",
      description: "Private, must never show in discovery",
      total_day: 1,
      category: Category.CULTURE,
      is_public: false,
      owner_id: owner.user_id,
      created_at: new Date("2026-01-04T00:00:00Z"),
      items: {
        create: [
          { day_no: 1, sequence_no: 1, visit_time: time("09:00"), location_id: watPho.location_id },
        ],
      },
    },
  });

  return {
    bangkokId: bangkok.province_id,
    chiangMaiId: chiangMai.province_id,
    plans: {
      temples: temples.schedule_id,
      northern: northern.schedule_id,
      longTrip: longTrip.schedule_id,
      secret: secret.schedule_id,
    },
  };
}
