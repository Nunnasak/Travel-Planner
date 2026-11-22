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
import { ScheduleService } from "@/core/service/schedule.service";
import { ScheduleItemService } from "@/core/service/scheduleItem.service";
import { LocationService } from "@/core/service/location.service";
import { MapLinkService } from "@/core/service/map-link.service";
import { FetchUrlResolver } from "./storage/fetch-url-resolver";
import { ShareService } from "@/core/service/share.service";
import { ImageUploadService } from "@/core/service/image-upload.service";
import { LocalImageStorage } from "./storage/local-image-storage";
import { SharpImageProcessor } from "./storage/sharp-image-processor";
import { UpdateUsername } from "@/core/service/update-username";
import { ChangePassword } from "@/core/service/change-password";
import { DeleteAccount } from "@/core/service/delete-account";
import { LogoutAllDevices } from "@/core/service/logout-all-devices";

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
  updateUsername: new UpdateUsername(users),
  changePassword: new ChangePassword(users, hasher, sessions, tokens),
  deleteAccount: new DeleteAccount(users, hasher, sessions),
  logoutAllDevices: new LogoutAllDevices(sessions),
};

export const discoveryService = new DiscoveryService(prisma);
export const scheduleService = new ScheduleService(prisma);
export const scheduleItemService = new ScheduleItemService(prisma, scheduleService);
export const locationService = new LocationService(prisma, new MapLinkService(new FetchUrlResolver()));
export const shareService = new ShareService(prisma, scheduleService);
export const imageStorage = new LocalImageStorage(process.env.UPLOAD_DIR ?? "uploads");
export const imageUploadService = new ImageUploadService(imageStorage, new SharpImageProcessor());
