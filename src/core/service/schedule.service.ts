import type { Prisma, PrismaClient } from "../../generated/prisma/client";
import { emptyDayNumbers, unorderedDayNumbers } from "../domain/schedule";
import { BadRequestError } from "../errors/bad-request.error";
import { ForbiddenError } from "../errors/forbidden.error";
import { NotFoundError } from "../errors/not-found.error";
import { createScheduleSchema, updateScheduleSchema } from "../schema/schedule.schema";

const ORDERED_ITEMS = [{ day_no: "asc" }, { sequence_no: "asc" }] as const;

const LOCATION_SELECT = {
  location_id: true,
  name: true,
  address: true,
  image_url: true,
  map_url: true,
  latitude: true,
  longitude: true,
  city: {
    select: {
      city_name: true,
      province: { select: { province_id: true, province_name: true } },
    },
  },
} as const;

function formatTime(value: Date): string {
  return value.toISOString().slice(11, 16);
}

export type Access = "owner" | "editor" | "viewer";

function visibleTo(userId: number): Prisma.ScheduleWhereInput {
  return { OR: [{ owner_id: userId }, { members: { some: { user_id: userId } } }] };
}

const POST_SELECT = { select: { schedule_id: true, updated_at: true } } satisfies Prisma.Schedule$postArgs;

const SNAPSHOT_SELECT = {
  schedule_name: true,
  description: true,
  total_day: true,
  cover_url: true,
  categories: true,
  items: {
    orderBy: [{ day_no: "asc" }, { sequence_no: "asc" }],
    select: { day_no: true, sequence_no: true, visit_time: true, location_id: true },
  },
} satisfies Prisma.ScheduleSelect;

export class ScheduleService {
  constructor(private readonly prisma: PrismaClient) {}

  async access(scheduleId: number, userId: number): Promise<Access> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { schedule_id: scheduleId },
      select: {
        owner_id: true,
        published_from_id: true,
        members: { where: { user_id: userId }, select: { role: true } },
      },
    });
    if (!schedule || schedule.published_from_id !== null) throw new NotFoundError("Plan not found.");
    if (schedule.owner_id === userId) return "owner";
    const role = schedule.members[0]?.role;
    if (role === "EDITOR") return "editor";
    if (role === "VIEWER") return "viewer";
    throw new NotFoundError("Plan not found.");
  }

  async assertCanEdit(scheduleId: number, userId: number) {
    const access = await this.access(scheduleId, userId);
    if (access === "viewer") throw new ForbiddenError("You can only view this plan.");
    return access;
  }

  async listMine(userId: number) {
    const rows = await this.prisma.schedule.findMany({
      where: { AND: [visibleTo(userId), { published_from_id: null }] },
      orderBy: { updated_at: "desc" },
      select: {
        schedule_id: true,
        schedule_name: true,
        description: true,
        total_day: true,
        cover_url: true,
        categories: true,
        updated_at: true,
        owner_id: true,
        post: POST_SELECT,
        items: {
          orderBy: [...ORDERED_ITEMS],
          select: { location: { select: { image_url: true } } },
        },
      },
    });

    return rows.map(({ items, owner_id, ...row }) => ({
      ...row,
      cover_url: row.cover_url ?? items.find((i) => i.location.image_url)?.location.image_url ?? null,
      place_count: items.length,
      is_owner: owner_id === userId,
    }));
  }

  async getForUser(scheduleId: number, userId: number) {
    const access = await this.access(scheduleId, userId);
    const schedule = await this.prisma.schedule.findUniqueOrThrow({
      where: { schedule_id: scheduleId },
      select: {
        schedule_id: true,
        schedule_name: true,
        description: true,
        total_day: true,
        cover_url: true,
        categories: true,
        created_at: true,
        updated_at: true,
        post: POST_SELECT,
        owner: { select: { user_id: true, username: true } },
        _count: { select: { members: true } },
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

    const { items, _count, ...rest } = schedule;
    const lastDay = Math.max(schedule.total_day, ...items.map((i) => i.day_no));
    const days = Array.from({ length: lastDay }, (_, index) => ({
      day_no: index + 1,
      stops: items
        .filter((item) => item.day_no === index + 1)
        .map((item) => ({
          item_id: item.item_id,
          sequence_no: item.sequence_no,
          visit_time: formatTime(item.visit_time),
          location: item.location,
        })),
    }));

    return { ...rest, access, can_edit: access !== "viewer", member_count: _count.members, days };
  }

  async create(userId: number, input: unknown) {
    const data = createScheduleSchema.parse(input);
    return this.prisma.schedule.create({ data: { ...data, owner_id: userId } });
  }

  async update(scheduleId: number, userId: number, input: unknown) {
    const data = updateScheduleSchema.parse(input);
    await this.assertCanEdit(scheduleId, userId);

    if (data.total_day !== undefined) {
      const last = await this.prisma.scheduleItem.aggregate({
        where: { schedule_id: scheduleId },
        _max: { day_no: true },
      });
      const usedDays = last._max.day_no ?? 0;
      if (data.total_day < usedDays) {
        throw new BadRequestError(
          `Day ${usedDays} still has places. Remove them before making the plan shorter.`,
          "total_day",
        );
      }
    }

    return this.prisma.schedule.update({ where: { schedule_id: scheduleId }, data });
  }

  async copy(scheduleId: number, userId: number) {
    const source = await this.prisma.schedule.findFirst({
      where: { schedule_id: scheduleId, OR: [{ is_public: true }, visibleTo(userId)] },
      select: SNAPSHOT_SELECT,
    });
    if (!source) throw new NotFoundError("Plan not found.");

    const { items, schedule_name, ...rest } = source;
    return this.prisma.schedule.create({
      data: {
        ...rest,
        schedule_name: `${schedule_name.slice(0, 93)} (copy)`,
        owner_id: userId,
        items: { create: items },
      },
    });
  }

  private async assertOwner(scheduleId: number, userId: number, message: string) {
    const access = await this.access(scheduleId, userId);
    if (access !== "owner") throw new ForbiddenError(message);
  }

  async publish(scheduleId: number, userId: number) {
    await this.assertOwner(scheduleId, userId, "Only the owner can post this plan to Discover.");
    const source = await this.prisma.schedule.findUniqueOrThrow({
      where: { schedule_id: scheduleId },
      select: { ...SNAPSHOT_SELECT, post: POST_SELECT },
    });
    const { items, post, ...fields } = source;
    const emptyDays = emptyDayNumbers(fields.total_day, items);
    if (emptyDays.length > 0) {
      throw new BadRequestError(`Add at least one place to day ${emptyDays.join(", ")} before posting.`);
    }
    const unorderedDays = unorderedDayNumbers(
      items.map((item) => ({ day_no: item.day_no, visit_time: formatTime(item.visit_time) })),
    );
    if (unorderedDays.length > 0) {
      throw new BadRequestError(`Put the places on day ${unorderedDays.join(", ")} in time order before posting.`);
    }

    return this.prisma.$transaction(async (tx) => {
      if (post) {
        await tx.scheduleItem.deleteMany({ where: { schedule_id: post.schedule_id } });
        return tx.schedule.update({
          where: { schedule_id: post.schedule_id },
          data: { ...fields, items: { create: items } },
          select: { schedule_id: true, updated_at: true },
        });
      }
      return tx.schedule.create({
        data: {
          ...fields,
          is_public: true,
          owner_id: userId,
          published_from_id: scheduleId,
          items: { create: items },
        },
        select: { schedule_id: true, updated_at: true },
      });
    });
  }

  async unpublish(scheduleId: number, userId: number) {
    await this.assertOwner(scheduleId, userId, "Only the owner can remove this plan from Discover.");
    const removed = await this.prisma.schedule.deleteMany({ where: { published_from_id: scheduleId } });
    if (removed.count === 0) throw new NotFoundError("This plan isn't on Discover.");
  }

  async delete(scheduleId: number, userId: number) {
    const access = await this.access(scheduleId, userId);
    if (access !== "owner") throw new ForbiddenError("Only the owner can delete this plan.");
    await this.prisma.schedule.delete({ where: { schedule_id: scheduleId } });
  }
}
