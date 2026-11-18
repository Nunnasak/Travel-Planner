import type { SessionRepository } from "@/core/ports/session-repository";

export class CleanupSessions {
  constructor(private sessions: SessionRepository) {}

  execute(): Promise<void> {
    return this.sessions.deleteExpired();
  }
}