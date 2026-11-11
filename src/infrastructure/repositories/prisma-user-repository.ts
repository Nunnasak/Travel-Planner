import type { PrismaClient } from "@/generated/prisma/client";
import type { UserRepository } from "@/core/ports/user-repository";
import type { User } from "@/core/domain/user";

type UserRow = {
  user_id: number;
  username: string;
  email: string;
  created_at: Date;
  password_hash: string;
};

function toDomain(row: UserRow): User {
  return {
    id: row.user_id,
    name: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? toDomain(row) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { username } });
    return row ? toDomain(row) : null;
  }

  async create(data: {
    email: string;
    name: string;
    passwordHash: string;
  }): Promise<User> {
    const row = await this.prisma.user.create({
      data: {
        email: data.email,
        username: data.name,
        password_hash: data.passwordHash,
      },
    });
    return toDomain(row);
  }
}

