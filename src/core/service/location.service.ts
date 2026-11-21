import type { PrismaClient } from "../../generated/prisma/client";
import { BadRequestError } from "../errors/bad-request.error";
import { createLocationSchema, locationSearchSchema } from "../schema/location.schema";

const LOCATION_SELECT = {
  location_id: true,
  name: true,
  address: true,
  image_url: true,
  city: {
    select: {
      city_id: true,
      city_name: true,
      province: { select: { province_id: true, province_name: true } },
    },
  },
} as const;

export class LocationService {
  constructor(private readonly prisma: PrismaClient) {}

  async search(input: unknown) {
    const { q } = locationSearchSchema.parse(input);
    const contains = { contains: q, mode: "insensitive" as const };
    return this.prisma.location.findMany({
      where: q
        ? {
            OR: [
              { name: contains },
              { address: contains },
              { city: { city_name: contains } },
              { city: { province: { province_name: contains } } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
      take: 10,
      select: LOCATION_SELECT,
    });
  }

  async create(input: unknown) {
    const data = createLocationSchema.parse(input);
    const city = await this.prisma.city.findUnique({
      where: { city_id: data.city_id },
      select: { city_id: true },
    });
    if (!city) throw new BadRequestError("That district doesn't exist.", "city_id");
    return this.prisma.location.create({ data, select: LOCATION_SELECT });
  }

  async listCities(provinceId: number) {
    return this.prisma.city.findMany({
      where: { province_id: provinceId },
      orderBy: { city_name: "asc" },
      select: { city_id: true, city_name: true },
    });
  }
}
