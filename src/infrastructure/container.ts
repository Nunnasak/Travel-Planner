import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaUserRepository } from "./repositories/prisma-user-repository";
import { PrismaSessionRepository } from "./repositories/prisma-session-repository";
import { BcryptPasswordHasher } from "./factories/password-hasher";
import { CryptoSessionTokenGenerator } from "./factories/session-token-generator";
import { RegisterUser } from "@/core/service/register-user";
import { LoginUser } from "@/core/service/login-user";
import { LogoutUser } from "@/core/service/logout-user";
import { GetCurrentUser } from "@/core/service/get-current-user";

// --- Prisma (กันสร้างซ้ำตอน hot reload) ---
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrisma();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// --- infrastructure ---
const users = new PrismaUserRepository(prisma);
const sessions = new PrismaSessionRepository(prisma);
const hasher = new BcryptPasswordHasher();
const tokens = new CryptoSessionTokenGenerator();

// --- core services ---
export const container = {
  registerUser: new RegisterUser(users, hasher),
  loginUser: new LoginUser(users, hasher, sessions, tokens),
  logoutUser: new LogoutUser(sessions, tokens),
  getCurrentUser: new GetCurrentUser(sessions, tokens, users),
};