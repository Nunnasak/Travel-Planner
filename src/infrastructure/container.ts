import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaUserRepository } from "./repositories/prisma-user-repository";
import { BcryptPasswordHasher } from "./factories/password-hasher";
import { RegisterUser } from "@/core/service/register-user";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrisma();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const users = new PrismaUserRepository(prisma);
const hasher = new BcryptPasswordHasher();

export const container = {
  registerUser: new RegisterUser(users, hasher),
};