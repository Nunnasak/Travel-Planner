import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Role } from "../../src/generated/prisma/client";
import { BadRequestError } from "@/core/errors/bad-request.error";
import { ForbiddenError } from "@/core/errors/forbidden.error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ScheduleService } from "@/core/service/schedule.service";
import { ShareService } from "@/core/service/share.service";
import { createTestPrisma, resetDb } from "../helpers/testDb";
import { addMember, seedPlanContext, type PlanContext } from "../fixtures/schedule";

const prisma = createTestPrisma();
const schedules = new ScheduleService(prisma);
const share = new ShareService(prisma, schedules);
let ctx: PlanContext;
let thirdUserId: number;

async function tokenOf() {
  const { share_path } = await share.getSharing(ctx.scheduleId, ctx.userId);
  return share_path.split("/").pop() ?? "";
}

async function roleOf(userId: number) {
  const member = await prisma.scheduleMember.findUnique({
    where: { user_id_schedule_id: { user_id: userId, schedule_id: ctx.scheduleId } },
  });
  return member?.role ?? null;
}

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await resetDb(prisma);
  ctx = await seedPlanContext(prisma);
  const third = await prisma.user.create({
    data: { username: "Third", email: "third@example.test", password_hash: "not-a-real-hash" },
  });
  thirdUserId = third.user_id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("ShareService.addMember / updateMember / removeMember", () => {
  it("adds people by username or by email with the chosen role", async () => {
    await share.addMember(ctx.scheduleId, ctx.userId, { identifier: "other", role: "VIEWER" });
    const sharing = await share.addMember(ctx.scheduleId, ctx.userId, {
      identifier: "THIRD@example.test",
      role: "EDITOR",
    });

    expect(sharing.members.map((m) => [m.username, m.role])).toEqual([
      ["other", "VIEWER"],
      ["Third", "EDITOR"],
    ]);
  });

  it("matches a username without caring about case", async () => {
    await share.addMember(ctx.scheduleId, ctx.userId, { identifier: "third", role: "VIEWER" });

    await expect(roleOf(thirdUserId)).resolves.toBe("VIEWER");
  });

  it("changes the role when the person is added again", async () => {
    await share.addMember(ctx.scheduleId, ctx.userId, { identifier: "other", role: "VIEWER" });
    await share.addMember(ctx.scheduleId, ctx.userId, { identifier: "other", role: "EDITOR" });

    await expect(prisma.scheduleMember.count()).resolves.toBe(1);
    await expect(roleOf(ctx.otherUserId)).resolves.toBe("EDITOR");
  });

  it.each([
    ["someone who does not exist", "nobody@example.test"],
    ["the owner", "tester"],
  ])("rejects adding %s", async (_label, identifier) => {
    await expect(
      share.addMember(ctx.scheduleId, ctx.userId, { identifier, role: "VIEWER" }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("only lets the owner change who has access", async () => {
    await addMember(prisma, ctx.scheduleId, ctx.otherUserId, Role.EDITOR);

    await expect(
      share.addMember(ctx.scheduleId, ctx.otherUserId, { identifier: "third", role: "VIEWER" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      share.setLinkAccess(ctx.scheduleId, ctx.otherUserId, { link_access: "EDITOR" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(share.removeMember(ctx.scheduleId, ctx.otherUserId, ctx.otherUserId)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("updates and removes a member", async () => {
    await addMember(prisma, ctx.scheduleId, ctx.otherUserId, Role.VIEWER);

    await share.updateMember(ctx.scheduleId, ctx.userId, ctx.otherUserId, { role: "EDITOR" });
    await expect(roleOf(ctx.otherUserId)).resolves.toBe("EDITOR");

    await share.removeMember(ctx.scheduleId, ctx.userId, ctx.otherUserId);
    await expect(roleOf(ctx.otherUserId)).resolves.toBeNull();
    await expect(share.removeMember(ctx.scheduleId, ctx.userId, ctx.otherUserId)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

describe("ShareService.getSharing", () => {
  it("shows emails only to the owner", async () => {
    await addMember(prisma, ctx.scheduleId, ctx.otherUserId, Role.VIEWER);

    const asOwner = await share.getSharing(ctx.scheduleId, ctx.userId);
    const asViewer = await share.getSharing(ctx.scheduleId, ctx.otherUserId);

    expect(asOwner).toMatchObject({
      can_manage: true,
      link_access: "RESTRICTED",
      owner: { email: "tester@example.test" },
    });
    expect(asViewer).toMatchObject({ can_manage: false, owner: { email: null } });
    expect(asViewer.members[0]).toMatchObject({ username: "other", email: null, is_you: true });
    expect(asViewer.share_path).toBe(asOwner.share_path);
  });

  it("hides the plan from people without access", async () => {
    await expect(share.getSharing(ctx.scheduleId, thirdUserId)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("ShareService.joinByToken", () => {
  it("does not let new people in while the link is restricted", async () => {
    const token = await tokenOf();

    await expect(share.joinByToken(token, thirdUserId)).rejects.toBeInstanceOf(ForbiddenError);
    await expect(prisma.scheduleMember.count()).resolves.toBe(0);
  });

  it("still opens a restricted link for people already added and for the owner", async () => {
    await addMember(prisma, ctx.scheduleId, ctx.otherUserId, Role.VIEWER);
    const token = await tokenOf();

    await expect(share.joinByToken(token, ctx.otherUserId)).resolves.toBe(ctx.scheduleId);
    await expect(share.joinByToken(token, ctx.userId)).resolves.toBe(ctx.scheduleId);
    await expect(prisma.scheduleMember.count()).resolves.toBe(1);
  });

  it("adds a new person with the link's role", async () => {
    await share.setLinkAccess(ctx.scheduleId, ctx.userId, { link_access: "VIEWER" });

    await expect(share.joinByToken(await tokenOf(), thirdUserId)).resolves.toBe(ctx.scheduleId);
    await expect(roleOf(thirdUserId)).resolves.toBe("VIEWER");
    await expect(schedules.listMine(thirdUserId)).resolves.toHaveLength(1);
  });

  it("upgrades a viewer through an editor link but never downgrades an editor", async () => {
    await addMember(prisma, ctx.scheduleId, ctx.otherUserId, Role.VIEWER);
    await addMember(prisma, ctx.scheduleId, thirdUserId, Role.EDITOR);
    await share.setLinkAccess(ctx.scheduleId, ctx.userId, { link_access: "EDITOR" });
    const token = await tokenOf();

    await share.joinByToken(token, ctx.otherUserId);
    await expect(roleOf(ctx.otherUserId)).resolves.toBe("EDITOR");

    await share.setLinkAccess(ctx.scheduleId, ctx.userId, { link_access: "VIEWER" });
    await share.joinByToken(token, thirdUserId);
    await expect(roleOf(thirdUserId)).resolves.toBe("EDITOR");
  });

  it("stops the old link working after a reset", async () => {
    await share.setLinkAccess(ctx.scheduleId, ctx.userId, { link_access: "VIEWER" });
    const oldToken = await tokenOf();

    await share.resetLink(ctx.scheduleId, ctx.userId);

    await expect(share.joinByToken(oldToken, thirdUserId)).rejects.toBeInstanceOf(NotFoundError);
    await expect(share.joinByToken(await tokenOf(), thirdUserId)).resolves.toBe(ctx.scheduleId);
  });
});

describe("ShareService.leave", () => {
  it("lets a member leave and drops the plan from their list", async () => {
    await addMember(prisma, ctx.scheduleId, ctx.otherUserId, Role.EDITOR);

    await share.leave(ctx.scheduleId, ctx.otherUserId);

    await expect(roleOf(ctx.otherUserId)).resolves.toBeNull();
    const mine = await schedules.listMine(ctx.otherUserId);
    expect(mine.map((plan) => plan.schedule_id)).not.toContain(ctx.scheduleId);
  });

  it("keeps the other members when one person leaves", async () => {
    await addMember(prisma, ctx.scheduleId, ctx.otherUserId, Role.VIEWER);
    await addMember(prisma, ctx.scheduleId, thirdUserId, Role.EDITOR);

    await share.leave(ctx.scheduleId, ctx.otherUserId);

    await expect(roleOf(thirdUserId)).resolves.toBe(Role.EDITOR);
  });

  it("does not let the owner leave their own plan", async () => {
    await expect(share.leave(ctx.scheduleId, ctx.userId)).rejects.toBeInstanceOf(BadRequestError);
    await expect(prisma.schedule.count({ where: { schedule_id: ctx.scheduleId } })).resolves.toBe(1);
  });

  it("hides the plan from someone who is not a member", async () => {
    await expect(share.leave(ctx.scheduleId, ctx.otherUserId)).rejects.toBeInstanceOf(NotFoundError);
  });
});
