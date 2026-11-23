import type { Prisma, PrismaClient } from "../../generated/prisma/client";
import { BadRequestError } from "../errors/bad-request.error";
import { NotFoundError } from "../errors/not-found.error";
import { reorderScheduleSchema } from "../schema/schedule.schema";
import {
  addScheduleItemSchema,
  createScheduleItemSchema,
  editScheduleItemSchema,
  updateScheduleItemSchema,
} from "../schema/scheduleItem.schema";
import { ScheduleService } from "./schedule.service";

type Tx = Prisma.TransactionClient;

const BY_SEQUENCE: Prisma.ScheduleItemOrderByWithRelationInput[] = [{ sequence_no: "asc" }];
const BY_TIME: Prisma.ScheduleItemOrderByWithRelationInput[] = [
  { visit_time: "asc" },
  { sequence_no: "asc" },
  { item_id: "asc" },
];

export class ScheduleItemService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly schedules: ScheduleService = new ScheduleService(prisma),
  ) {}

  async create(input: unknown) {
    const data = createScheduleItemSchema.parse(input);
    return this.prisma.scheduleItem.create({ data });
  }

  async update(itemId: number, input: unknown) {
    const data = updateScheduleItemSchema.parse(input);
    return this.prisma.scheduleItem.update({ where: { item_id: itemId }, data });
  }

  async addToSchedule(scheduleId: number, userId: number, input: unknown) {
    const data = addScheduleItemSchema.parse(input);
    await this.schedules.assertCanEdit(scheduleId, userId);
    await this.assertDayInPlan(scheduleId, data.day_no);

    const location = await this.prisma.location.findUnique({
      where: { location_id: data.location_id },
      select: { location_id: true },
    });
    if (!location) throw new BadRequestError("That place no longer exists.", "location_id");

    return this.prisma.$transaction(async (tx) =>
      tx.scheduleItem.create({
        data: {
          ...data,
          schedule_id: scheduleId,
          sequence_no: await this.nextSequence(tx, scheduleId, data.day_no),
        },
      }),
    );
  }

  async editInSchedule(scheduleId: number, itemId: number, userId: number, input: unknown) {
    const data = editScheduleItemSchema.parse(input);
    await this.schedules.assertCanEdit(scheduleId, userId);
    const item = await this.findItem(scheduleId, itemId);

    if (data.day_no === undefined || data.day_no === item.day_no) {
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.scheduleItem.update({
          where: { item_id: itemId },
          data: { visit_time: data.visit_time },
        });
        if (data.visit_time !== undefined) await this.renumberDay(tx, scheduleId, item.day_no, BY_TIME);
        return updated;
      });
    }

    const newDay = data.day_no;
    await this.assertDayInPlan(scheduleId, newDay);
    return this.prisma.$transaction(async (tx) => {
      const moved = await tx.scheduleItem.update({
        where: { item_id: itemId },
        data: {
          day_no: newDay,
          visit_time: data.visit_time,
          sequence_no: await this.nextSequence(tx, scheduleId, newDay),
        },
      });
      await this.renumberDay(tx, scheduleId, item.day_no);
      if (data.visit_time !== undefined) await this.renumberDay(tx, scheduleId, newDay, BY_TIME);
      return moved;
    });
  }

  async removeFromSchedule(scheduleId: number, itemId: number, userId: number) {
    await this.schedules.assertCanEdit(scheduleId, userId);
    const item = await this.findItem(scheduleId, itemId);
    await this.prisma.$transaction(async (tx) => {
      await tx.scheduleItem.delete({ where: { item_id: itemId } });
      await this.renumberDay(tx, scheduleId, item.day_no);
    });
  }

  async reorder(scheduleId: number, userId: number, input: unknown) {
    const { days } = reorderScheduleSchema.parse(input);
    await this.schedules.assertCanEdit(scheduleId, userId);

    const schedule = await this.prisma.schedule.findUniqueOrThrow({
      where: { schedule_id: scheduleId },
      select: { total_day: true, items: { select: { item_id: true } } },
    });

    const sent = days.flatMap((day) => day.item_ids);
    const existing = new Set(schedule.items.map((item) => item.item_id));
    const complete =
      sent.length === existing.size &&
      new Set(sent).size === sent.length &&
      sent.every((id) => existing.has(id));
    if (!complete) {
      throw new BadRequestError("The plan changed in the meantime. Reload the page and try again.");
    }
    if (days.some((day) => day.day_no > schedule.total_day)) {
      throw new BadRequestError(`This plan only has ${schedule.total_day} days.`);
    }

    await this.prisma.$transaction(async (tx) => {
      for (const id of sent) {
        await tx.scheduleItem.update({ where: { item_id: id }, data: { sequence_no: -id } });
      }
      for (const day of days) {
        for (const [index, id] of day.item_ids.entries()) {
          await tx.scheduleItem.update({
            where: { item_id: id },
            data: { day_no: day.day_no, sequence_no: index + 1 },
          });
        }
      }
    });

    return this.schedules.getForUser(scheduleId, userId);
  }

  private async findItem(scheduleId: number, itemId: number) {
    const item = await this.prisma.scheduleItem.findFirst({
      where: { item_id: itemId, schedule_id: scheduleId },
      select: { item_id: true, day_no: true },
    });
    if (!item) throw new NotFoundError("Place not found in this plan.");
    return item;
  }

  private async assertDayInPlan(scheduleId: number, dayNo: number) {
    const schedule = await this.prisma.schedule.findUniqueOrThrow({
      where: { schedule_id: scheduleId },
      select: { total_day: true },
    });
    if (dayNo > schedule.total_day) {
      throw new BadRequestError(`This plan only has ${schedule.total_day} days.`, "day_no");
    }
  }

  private async nextSequence(tx: Tx, scheduleId: number, dayNo: number) {
    const last = await tx.scheduleItem.aggregate({
      where: { schedule_id: scheduleId, day_no: dayNo },
      _max: { sequence_no: true },
    });
    return (last._max.sequence_no ?? 0) + 1;
  }

  private async renumberDay(
    tx: Tx,
    scheduleId: number,
    dayNo: number,
    orderBy: Prisma.ScheduleItemOrderByWithRelationInput[] = BY_SEQUENCE,
  ) {
    const items = await tx.scheduleItem.findMany({
      where: { schedule_id: scheduleId, day_no: dayNo },
      orderBy,
      select: { item_id: true },
    });
    for (const item of items) {
      await tx.scheduleItem.update({
        where: { item_id: item.item_id },
        data: { sequence_no: -item.item_id },
      });
    }
    for (const [index, item] of items.entries()) {
      await tx.scheduleItem.update({
        where: { item_id: item.item_id },
        data: { sequence_no: index + 1 },
      });
    }
  }
}
