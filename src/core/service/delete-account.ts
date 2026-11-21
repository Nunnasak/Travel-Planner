import type { UserRepository } from "@/core/ports/user-repository";
import type { PasswordHasher } from "@/core/ports/password-hasher";
import type { SessionRepository } from "@/core/ports/session-repository";
import type { DeleteAccountInput } from "@/core/schema/auth";
import { InvalidCredentialsError } from "@/core/errors/auth";
import { NotFoundError } from "@/core/errors/not-found.error";

export class DeleteAccount {
  constructor(
    private users: UserRepository,
    private hasher: PasswordHasher,
    private sessions: SessionRepository
  ) {}

  async execute(userId: number, input: DeleteAccountInput): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError("Account not found.");

    const ok = await this.hasher.compare(input.password, user.passwordHash);
    if (!ok) throw new InvalidCredentialsError();

    await this.sessions.deleteAllByUserId(userId);
    await this.users.delete(userId); // schedules + members cascade ใน DB
  }
}