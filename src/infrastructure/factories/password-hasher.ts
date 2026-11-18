import bcrypt from "bcryptjs";
import type { PasswordHasher } from "@/core/ports/password-hasher";

export class BcryptPasswordHasher implements PasswordHasher {
  hash(plain: string) {
    return bcrypt.hash(plain, 12);
  }
  compare(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
}