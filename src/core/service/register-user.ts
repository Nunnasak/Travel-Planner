import type { UserRepository } from "@/core/ports/user-repository";
import type { PasswordHasher } from "@/core/ports/password-hasher";
import type { RegisterInput } from "@/core/schema/auth";
import type { PublicUser } from "@/core/domain/user";
import { EmailAlreadyExistsError, UsernameAlreadyExistsError, DuplicateFieldsError } from "@/core/errors/auth";

export class RegisterUser {
  constructor(
    private users: UserRepository,
    private hasher: PasswordHasher
  ) {}

  async execute(input: RegisterInput): Promise<PublicUser> {
    const [byEmail, byUsername] = await Promise.all([
      this.users.findByEmail(input.email),
      this.users.findByUsername(input.username),
    ]);

    if (byEmail || byUsername) {
      throw new DuplicateFieldsError({
        email: !!byEmail,
        username: !!byUsername,
      });
    }

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({
      email: input.email,
      name: input.username,
      passwordHash,
    });

    const { passwordHash: _omit, ...publicUser } = user;
    return publicUser;
  }
}