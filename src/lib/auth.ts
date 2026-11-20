import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { container } from "@/infrastructure/container";
import { SESSION_COOKIE } from "@/core/constants/session";

export async function getSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return container.getCurrentUser.execute(token);
}

// สำหรับ API route: คืน user + token ของ session ปัจจุบัน (null ถ้ายังไม่ login)
export async function requireSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = await container.getCurrentUser.execute(token);
  return user ? { user, token } : null;
}