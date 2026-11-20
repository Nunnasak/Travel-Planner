import type { UserRepository } from "@/core/ports/user-repository";
import type { UpdateUsernameInput } from "@/core/schema/auth";
import type { PublicUser } from "@/core/domain/user";
import { DuplicateFieldsError } from "@/core/errors/auth";
import { NotFoundError } from "@/core/errors/not-found.error";

export class UpdateUsername {
  constructor(private users: UserRepository) {}

  async execute(userId: number, input: UpdateUsernameInput): Promise<PublicUser> {
    const taken = await this.users.findByUsername(input.username);
    if (taken && taken.id !== userId) {
      throw new DuplicateFieldsError({ username: true });
    }

    try {
      const user = await this.users.updateUsername(userId, input.username);
      const { passwordHash: _omit, ...publicUser } = user;
      return publicUser;
    } catch (error) {
      if ((error as { code?: string }).code === "P2025") {
        throw new NotFoundError("Account not found.");
      }
      throw error;
    }
  }
}