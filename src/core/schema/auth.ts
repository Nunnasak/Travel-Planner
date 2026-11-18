import { z } from "zod";
import {
  USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH, PASSWORD_MAX_BYTES,
} from "@/core/constants/auth.constants";

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

const withinBcryptLimit = (s: string) => new TextEncoder().encode(s).length <= PASSWORD_MAX_BYTES;
const tooLong = { message: "Password is too long." };

const newPassword = z.string().min(PASSWORD_MIN_LENGTH).refine(withinBcryptLimit, tooLong);
const existingPassword = z.string().min(1).refine(withinBcryptLimit, tooLong);
const username = z.string().trim().min(USERNAME_MIN_LENGTH).max(USERNAME_MAX_LENGTH);

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: newPassword,
  username,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: existingPassword,
  remember: z.boolean().optional().default(false),
});

export const updateUsernameSchema = z.object({ username });

export const changePasswordSchema = z
  .object({ currentPassword: existingPassword, newPassword })
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from the current one.",
  });

export const deleteAccountSchema = z.object({ password: existingPassword });

