import { PrismaClient } from "../../generated/prisma/client";
import {
  createScheduleItemSchema,
  updateScheduleItemSchema,
} from "../schema/scheduleItem.schema";

export class ScheduleItemService {
  constructor(private readonly prisma: PrismaClient) {}

  create(input: unknown) {
    const data = createScheduleItemSchema.parse(input);
    return this.prisma.scheduleItem.create({ data });
  }

  update(itemId: number, input: unknown) {
    const data = updateScheduleItemSchema.parse(input);
    return this.prisma.scheduleItem.update({ where: { item_id: itemId }, data });
  }
}