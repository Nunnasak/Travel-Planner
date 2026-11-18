import { prisma } from "@/lib/prisma";
import { PrismaUserRepository } from "./repositories/prisma-user-repository";
import { PrismaSessionRepository } from "./repositories/prisma-session-repository";
import { BcryptPasswordHasher } from "./factories/password-hasher";
import { CryptoSessionTokenGenerator } from "./factories/session-token-generator";
import { RegisterUser } from "@/core/service/register-user";
import { LoginUser } from "@/core/service/login-user";
import { LogoutUser } from "@/core/service/logout-user";
import { GetCurrentUser } from "@/core/service/get-current-user";
import { CleanupSessions } from "@/core/service/cleanup-sessions";
import { DiscoveryService } from "@/core/service/discovery.service";

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
  cleanupSessions: new CleanupSessions(sessions),
};

export const discoveryService = new DiscoveryService(prisma);
