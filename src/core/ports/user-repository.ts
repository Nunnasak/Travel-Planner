import type { User } from "@/core/domain/user";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(data: { email: string; name: string; passwordHash: string }): Promise<User>;
}