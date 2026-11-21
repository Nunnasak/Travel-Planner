import type { Session } from "@/core/domain/session";

export interface SessionRepository {
  create(data: { userId: number; tokenHash: string; expiresAt: Date }): Promise<Session>;
  findValidByTokenHash(tokenHash: string): Promise<Session | null>;
  deleteByTokenHash(tokenHash: string): Promise<void>;
  deleteAllByUserId(userId: number): Promise<void>;
  deleteExpired(): Promise<void>;
  deleteAllByUserIdExcept(userId: number, keepTokenHash: string): Promise<void>;
}