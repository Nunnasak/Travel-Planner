import type { PrismaClient } from "@/generated/prisma/client";
import type { SessionRepository } from "@/core/ports/session-repository";
import type { Session } from "@/core/domain/session";

type SessionRow = {
  session_id: number;
  user_id: number;
  expires_at: Date;
  created_at: Date;
};

function toDomain(row: SessionRow): Session {
  return {
    id: row.session_id,
    userId: row.user_id,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export class PrismaSessionRepository implements SessionRepository {
  constructor(private prisma: PrismaClient) { }

  async create(data: { userId: number; tokenHash: string; expiresAt: Date }) {
    const row = await this.prisma.session.create({
      data: {
        user_id: data.userId,
        token_hash: data.tokenHash,
        expires_at: data.expiresAt,
      },
    });
    return toDomain(row);
  }

  async findValidByTokenHash(tokenHash: string) {
    const row = await this.prisma.session.findFirst({
      where: { token_hash: tokenHash, expires_at: { gt: new Date() } },
    });
    return row ? toDomain(row) : null;
  }

  async deleteByTokenHash(tokenHash: string) {
    // deleteMany ไม่ throw ถ้าไม่เจอ (logout ซ้ำได้)
    await this.prisma.session.deleteMany({ where: { token_hash: tokenHash } });
  }

  async deleteAllByUserId(userId: number) {
    await this.prisma.session.deleteMany({ where: { user_id: userId } });
  }

  async deleteAllByUserIdExcept(userId: number, keepTokenHash: string) {
    await this.prisma.session.deleteMany({
      where: { user_id: userId, token_hash: { not: keepTokenHash } },
    });
  }

  async deleteExpired() {
    await this.prisma.session.deleteMany({ where: { expires_at: { lte: new Date() } } });
  }
}