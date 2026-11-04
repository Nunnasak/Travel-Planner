import type { UserRepository } from "@/core/ports/user-repository";
import type { PasswordHasher } from "@/core/ports/password-hasher";
import type { TokenService } from "@/core/ports/token-service";
import type { LoginInput } from "@/core/schema/auth";
import type { PublicUser } from "@/core/domain/user";
import { InvalidCredentialsError } from "@/core/errors/auth";

export class LoginUser {
  constructor(
    private users: UserRepository,
    private hasher: PasswordHasher,
    private tokens: TokenService
  ) {}

  async execute(input: LoginInput): Promise<{ user: PublicUser; token: string }> {
    const user = await this.users.findByEmail(input.email);
    if (!user) throw new InvalidCredentialsError();

    const ok = await this.hasher.compare(input.password, user.passwordHash);
    if (!ok) throw new InvalidCredentialsError();

    const token = await this.tokens.sign({ userId: user.id });

    const { passwordHash: _omit, ...publicUser } = user;
    return { user: publicUser, token };
  }
}