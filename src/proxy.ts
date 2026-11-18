// src/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/core/constants/session";

const PROTECTED = ["/schedules", "/account"]; // ปรับให้ตรงหน้าจริง

function matches(pathname: string, bases: string[]) {
  return bases.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // ไม่มี cookie เลย และเข้าหน้าที่ต้อง login → ไป login
  if (!hasSession && matches(pathname, PROTECTED)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ลบส่วนที่ redirect ออกจาก /login, /register ทิ้ง (ย้ายไปเช็คในหน้าแล้ว)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};