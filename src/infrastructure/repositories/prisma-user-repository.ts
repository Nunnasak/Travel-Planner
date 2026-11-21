import type { PrismaClient } from "@/generated/prisma/client";
import type { UserRepository } from "@/core/ports/user-repository";
import type { User } from "@/core/domain/user";
import { DuplicateFieldsError } from "@/core/errors/auth";

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
  constructor(private prisma: PrismaClient) { }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? toDomain(row) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { username } });
    return row ? toDomain(row) : null;
  }

  async findById(id: number): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { user_id: id } });
    return row ? toDomain(row) : null;
  }

  async create(data: { email: string; name: string; passwordHash: string }): Promise<User> {
    try {
      const row = await this.prisma.user.create({
        data: {
          email: data.email,
          username: data.name,
          password_hash: data.passwordHash,
        },
      });
      return toDomain(row);
    } catch (error) {
      const e = error as { code?: string; message?: string };
      if (e.code === "P2002") {
        const name = /constraint: `([^`]+)`/.exec(e.message ?? "")?.[1] ?? "";
        throw new DuplicateFieldsError({
          email: name.includes("email"),
          username: name.includes("username"),
        });
      }
      throw error;
    }
  }
  
  async updateUsername(id: number, name: string): Promise<User> {
    try {
      const row = await this.prisma.user.update({
        where: { user_id: id },
        data: { username: name },
      });
      return toDomain(row);
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        throw new DuplicateFieldsError({ username: true });
      }
      throw error;
    }
  }

  async updatePasswordHash(id: number, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { user_id: id },
      data: { password_hash: passwordHash },
    });
  }

  async delete(id: number): Promise<void> {
    // sessions / schedules / schedule_members ถูกลบตาม ON DELETE CASCADE
    await this.prisma.user.deleteMany({ where: { user_id: id } });
  }
}

