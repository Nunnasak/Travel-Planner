import type { SessionRepository } from "@/core/ports/session-repository";

export class LogoutAllDevices {
  constructor(private sessions: SessionRepository) {}

  async execute(userId: number): Promise<void> {
    await this.sessions.deleteAllByUserId(userId);
  }
}