import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/core/constants/session";

// หน้าที่ต้อง login ก่อนถึงเข้าได้
const PROTECTED = ["/discover", "/schedule"];
// หน้าที่คน login แล้วไม่ควรเข้า
const AUTH_PAGES = ["/login", "/register"];

function matches(pathname: string, bases: string[]) {
  return bases.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && matches(pathname, PROTECTED)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSession && matches(pathname, AUTH_PAGES)) {
    return NextResponse.redirect(new URL("/discover", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // ไม่ให้ proxy ทำงานกับ API, ไฟล์ static และรูป
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};