import type { UserRepository } from "@/core/ports/user-repository";
import type { PasswordHasher } from "@/core/ports/password-hasher";
import type { SessionRepository } from "@/core/ports/session-repository";
import type { SessionTokenGenerator } from "@/core/ports/session-token-generator";
import type { LoginInput } from "@/core/schema/auth";
import type { PublicUser } from "@/core/domain/user";
import { InvalidCredentialsError } from "@/core/errors/auth";
import { SESSION_TTL_MS } from "@/core/constants/session";

export class LoginUser {
  constructor(
    private users: UserRepository,
    private hasher: PasswordHasher,
    private sessions: SessionRepository,
    private tokens: SessionTokenGenerator
  ) {}

  async execute(input: LoginInput): Promise<{
    user: PublicUser;
    token: string;
    expiresAt: Date;
  }> {
    const user = await this.users.findByEmail(input.email);
    if (!user) throw new InvalidCredentialsError();

    const ok = await this.hasher.compare(input.password, user.passwordHash);
    if (!ok) throw new InvalidCredentialsError();

    const { token, tokenHash } = this.tokens.generate();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await this.sessions.create({ userId: user.id, tokenHash, expiresAt });

    const { passwordHash: _omit, ...publicUser } = user;
    return { user: publicUser, token, expiresAt };
  }
}