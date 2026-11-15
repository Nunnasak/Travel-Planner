import { randomBytes, createHash } from "node:crypto";
import type { SessionTokenGenerator } from "@/core/ports/session-token-generator";

export class CryptoSessionTokenGenerator implements SessionTokenGenerator {
  generate() {
    const token = randomBytes(32).toString("hex"); // 64 ตัวอักษร
    return { token, tokenHash: this.hash(token) };
  }

  hash(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }
}