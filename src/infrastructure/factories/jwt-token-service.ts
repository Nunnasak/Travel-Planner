import { SignJWT, jwtVerify } from "jose";
import type { TokenService } from "@/core/ports/token-service";

export class JwtTokenService implements TokenService {
  private secret: Uint8Array;

  constructor(secret: string) {
    this.secret = new TextEncoder().encode(secret);
  }

  async sign(payload: { userId: number }) {
    return new SignJWT({ userId: payload.userId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(this.secret);
  }

  async verify(token: string) {
    try {
      const { payload } = await jwtVerify(token, this.secret);
      return { userId: payload.userId as number };
    } catch {
      return null; // หมดอายุหรือถูกแก้ไข
    }
  }
}