import type { SessionRepository } from "@/core/ports/session-repository";
import type { SessionTokenGenerator } from "@/core/ports/session-token-generator";
import type { UserRepository } from "@/core/ports/user-repository";
import type { PublicUser } from "@/core/domain/user";

export class GetCurrentUser {
  constructor(
    private sessions: SessionRepository,
    private tokens: SessionTokenGenerator,
    private users: UserRepository
  ) {}

  async execute(token: string | undefined): Promise<PublicUser | null> {
    if (!token) return null;

    const session = await this.sessions.findValidByTokenHash(this.tokens.hash(token));
    if (!session) return null;

    const user = await this.users.findById(session.userId);
    if (!user) return null;

    const { passwordHash: _omit, ...publicUser } = user;
    return publicUser;
  }
}