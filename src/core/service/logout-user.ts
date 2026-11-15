import type { SessionRepository } from "@/core/ports/session-repository";
import type { SessionTokenGenerator } from "@/core/ports/session-token-generator";

export class LogoutUser {
  constructor(
    private sessions: SessionRepository,
    private tokens: SessionTokenGenerator
  ) {}

  async execute(token: string | undefined): Promise<void> {
    if (!token) return;
    await this.sessions.deleteByTokenHash(this.tokens.hash(token));
  }
}