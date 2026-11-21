import type { Prisma, PrismaClient } from "../../generated/prisma/client";
import { NotFoundError } from "../errors/not-found.error";
import { DAYS_OR_MORE, discoveryQuerySchema } from "../schema/discovery.schema";

const ORDERED_ITEMS = [{ day_no: "asc" }, { sequence_no: "asc" }] as const;

const LOCATION_SELECT = {
  location_id: true,
  name: true,
  address: true,
  image_url: true,
  city: {
    select: {
      city_name: true,
      province: { select: { province_id: true, province_name: true } },
    },
  },
} as const;

// "HH:MM" from a Postgres TIME value (stored as 1970-01-01T..Z).
function formatTime(value: Date): string {
  return value.toISOString().slice(11, 16);
}

export class DiscoveryService {
  constructor(private readonly prisma: PrismaClient) {}

  // GET /api/discovery - public plans with search, filters and pages
  async list(input: unknown) {
    const query = discoveryQuerySchema.parse(input);

    const where: Prisma.ScheduleWhereInput = { is_public: true };
    if (query.category) where.categories = { hasSome: query.category };
    if (query.days !== undefined) {
      where.total_day =
        query.days === DAYS_OR_MORE ? { gte: DAYS_OR_MORE } : query.days;
    }
    if (query.city_id !== undefined) {
      where.items = { some: { location: { city_id: query.city_id } } };
    } else if (query.province_id !== undefined) {
      where.items = {
        some: { location: { city: { province_id: query.province_id } } },
      };
    }
    if (query.q) {
      const contains = { contains: query.q, mode: "insensitive" as const };
      where.OR = [
        { schedule_name: contains },
        { description: contains },
        { items: { some: { location: { name: contains } } } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.schedule.count({ where }),
      this.prisma.schedule.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (query.page - 1) * query.page_size,
        take: query.page_size,
        select: {
          schedule_id: true,
          schedule_name: true,
          description: true,
          total_day: true,
          cover_url: true,
          categories: true,
          created_at: true,
          owner: { select: { user_id: true, username: true } },
          items: {
            orderBy: [...ORDERED_ITEMS],
            select: { location: { select: LOCATION_SELECT } },
          },
        },
      }),
    ]);

    const items = rows.map((row) => {
      const provinces = [
        ...new Set(row.items.map((item) => item.location.city.province.province_name)),
      ];
      const firstImage =
        row.items.find((item) => item.location.image_url)?.location.image_url ?? null;
      return {
        schedule_id: row.schedule_id,
        schedule_name: row.schedule_name,
        description: row.description,
        total_day: row.total_day,
        categories: row.categories,
        cover_url: row.cover_url ?? firstImage,
        created_at: row.created_at,
        owner: row.owner,
        provinces,
        place_count: row.items.length,
      };
    });

    return {
      items,
      page: query.page,
      page_size: query.page_size,
      total,
      total_pages: Math.max(1, Math.ceil(total / query.page_size)),
    };
  }

  // GET /api/discovery/[scheduleId] - one public plan, grouped by day
  async getPublic(scheduleId: number) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { schedule_id: scheduleId, is_public: true },
      select: {
        schedule_id: true,
        schedule_name: true,
        description: true,
        total_day: true,
        cover_url: true,
        categories: true,
        created_at: true,
        owner: { select: { user_id: true, username: true } },
        items: {
          orderBy: [...ORDERED_ITEMS],
          select: {
            item_id: true,
            day_no: true,
            sequence_no: true,
            visit_time: true,
            location: { select: LOCATION_SELECT },
          },
        },
      },
    });
    if (!schedule) throw new NotFoundError("Plan not found.");

    const days = new Map<number, Array<{
      item_id: number;
      sequence_no: number;
      visit_time: string;
      location: (typeof schedule.items)[number]["location"];
    }>>();
    for (const item of schedule.items) {
      const stops = days.get(item.day_no) ?? [];
      stops.push({
        item_id: item.item_id,
        sequence_no: item.sequence_no,
        visit_time: formatTime(item.visit_time),
        location: item.location,
      });
      days.set(item.day_no, stops);
    }

    const { items: _items, ...rest } = schedule;
    return {
      ...rest,
      days: [...days.entries()].map(([day_no, stops]) => ({ day_no, stops })),
    };
  }

  // GET /api/provinces - for the province filter dropdown
  async listProvinces() {
    return this.prisma.province.findMany({
      orderBy: { province_name: "asc" },
      select: { province_id: true, province_name: true },
    });
  }
}