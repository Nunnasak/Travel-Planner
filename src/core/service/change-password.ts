import type { UserRepository } from "@/core/ports/user-repository";
import type { PasswordHasher } from "@/core/ports/password-hasher";
import type { SessionRepository } from "@/core/ports/session-repository";
import type { SessionTokenGenerator } from "@/core/ports/session-token-generator";
import type { ChangePasswordInput } from "@/core/schema/auth";
import { InvalidCredentialsError } from "@/core/errors/auth";
import { NotFoundError } from "@/core/errors/not-found.error";

export class ChangePassword {
  constructor(
    private users: UserRepository,
    private hasher: PasswordHasher,
    private sessions: SessionRepository,
    private tokens: SessionTokenGenerator
  ) {}

  /** currentToken = session cookie ของเครื่องที่ใช้อยู่ (จะไม่ถูกเตะออก) */
  async execute(
    userId: number,
    currentToken: string,
    input: ChangePasswordInput
  ): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError("Account not found.");

    const ok = await this.hasher.compare(input.currentPassword, user.passwordHash);
    if (!ok) throw new InvalidCredentialsError();

    const passwordHash = await this.hasher.hash(input.newPassword);
    await this.users.updatePasswordHash(userId, passwordHash);

    // เตะ session อื่นทั้งหมดออก
    await this.sessions.deleteAllByUserIdExcept(userId, this.tokens.hash(currentToken));
  }
}