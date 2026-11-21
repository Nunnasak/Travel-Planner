import { randomBytes } from "node:crypto";
import type { PrismaClient } from "../../generated/prisma/client";
import { BadRequestError } from "../errors/bad-request.error";
import { ForbiddenError } from "../errors/forbidden.error";
import { NotFoundError } from "../errors/not-found.error";
import { addMemberSchema, linkAccessSchema, updateMemberSchema } from "../schema/share.schema";
import { ScheduleService } from "./schedule.service";

function newToken() {
  return randomBytes(24).toString("base64url");
}

export class ShareService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly schedules = new ScheduleService(prisma),
  ) {}

  private async assertOwner(scheduleId: number, userId: number) {
    const access = await this.schedules.access(scheduleId, userId);
    if (access !== "owner") throw new ForbiddenError("Only the owner can change who has access.");
  }

  private async ensureToken(scheduleId: number, token: string | null) {
    if (token) return token;
    const created = newToken();
    await this.prisma.schedule.update({ where: { schedule_id: scheduleId }, data: { share_token: created } });
    return created;
  }

  async getSharing(scheduleId: number, userId: number) {
    const access = await this.schedules.access(scheduleId, userId);
    const canManage = access === "owner";
    const schedule = await this.prisma.schedule.findUniqueOrThrow({
      where: { schedule_id: scheduleId },
      select: {
        share_token: true,
        link_access: true,
        is_public: true,
        owner: { select: { user_id: true, username: true, email: true } },
        members: {
          select: { role: true, user: { select: { user_id: true, username: true, email: true } } },
        },
      },
    });
    const token = await this.ensureToken(scheduleId, schedule.share_token);
    const person = (user: { user_id: number; username: string; email: string }) => ({
      user_id: user.user_id,
      username: user.username,
      email: canManage ? user.email : null,
      is_you: user.user_id === userId,
    });

    return {
      can_manage: canManage,
      is_public: schedule.is_public,
      link_access: schedule.link_access,
      share_path: `/share/${token}`,
      owner: person(schedule.owner),
      members: schedule.members
        .map((member) => ({ ...person(member.user), role: member.role }))
        .sort((a, b) => a.username.localeCompare(b.username, undefined, { sensitivity: "base" })),
    };
  }

  async addMember(scheduleId: number, ownerId: number, input: unknown) {
    const data = addMemberSchema.parse(input);
    await this.assertOwner(scheduleId, ownerId);

    const identifier = data.identifier;
    const user = await this.prisma.user.findFirst({
      where: identifier.includes("@")
        ? { email: identifier.toLowerCase() }
        : { username: { equals: identifier, mode: "insensitive" } },
      select: { user_id: true },
    });
    if (!user) throw new BadRequestError("No one has that username or email.", "identifier");
    if (user.user_id === ownerId) throw new BadRequestError("You already own this plan.", "identifier");

    await this.prisma.scheduleMember.upsert({
      where: { user_id_schedule_id: { user_id: user.user_id, schedule_id: scheduleId } },
      create: { user_id: user.user_id, schedule_id: scheduleId, role: data.role },
      update: { role: data.role },
    });
    return this.getSharing(scheduleId, ownerId);
  }

  async updateMember(scheduleId: number, ownerId: number, memberId: number, input: unknown) {
    const data = updateMemberSchema.parse(input);
    await this.assertOwner(scheduleId, ownerId);
    const updated = await this.prisma.scheduleMember.updateMany({
      where: { schedule_id: scheduleId, user_id: memberId },
      data: { role: data.role },
    });
    if (updated.count === 0) throw new NotFoundError("That person doesn't have access to this plan.");
    return this.getSharing(scheduleId, ownerId);
  }

  async removeMember(scheduleId: number, ownerId: number, memberId: number) {
    await this.assertOwner(scheduleId, ownerId);
    const removed = await this.prisma.scheduleMember.deleteMany({
      where: { schedule_id: scheduleId, user_id: memberId },
    });
    if (removed.count === 0) throw new NotFoundError("That person doesn't have access to this plan.");
    return this.getSharing(scheduleId, ownerId);
  }

  async setLinkAccess(scheduleId: number, ownerId: number, input: unknown) {
    const data = linkAccessSchema.parse(input);
    await this.assertOwner(scheduleId, ownerId);
    await this.prisma.schedule.update({
      where: { schedule_id: scheduleId },
      data: { link_access: data.link_access },
    });
    return this.getSharing(scheduleId, ownerId);
  }

  async resetLink(scheduleId: number, ownerId: number) {
    await this.assertOwner(scheduleId, ownerId);
    await this.prisma.schedule.update({
      where: { schedule_id: scheduleId },
      data: { share_token: newToken() },
    });
    return this.getSharing(scheduleId, ownerId);
  }

  async joinByToken(token: string, userId: number) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { share_token: token },
      select: {
        schedule_id: true,
        owner_id: true,
        link_access: true,
        members: { where: { user_id: userId }, select: { role: true } },
      },
    });
    if (!schedule) throw new NotFoundError("This link doesn't work anymore.");
    if (schedule.owner_id === userId) return schedule.schedule_id;

    const current = schedule.members[0]?.role;
    if (schedule.link_access === "RESTRICTED") {
      if (current) return schedule.schedule_id;
      throw new ForbiddenError("Ask the owner to give you access.");
    }

    const linkRole = schedule.link_access;
    if (!current) {
      await this.prisma.scheduleMember.create({
        data: { user_id: userId, schedule_id: schedule.schedule_id, role: linkRole },
      });
    } else if (current === "VIEWER" && linkRole === "EDITOR") {
      await this.prisma.scheduleMember.update({
        where: { user_id_schedule_id: { user_id: userId, schedule_id: schedule.schedule_id } },
        data: { role: "EDITOR" },
      });
    }
    return schedule.schedule_id;
  }
}
