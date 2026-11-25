import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/core/constants/session";
import { requireSession } from "@/lib/auth";

// Navbar ใช้เช็คว่า session ของเครื่องนี้ยังใช้ได้อยู่ไหม
// (เช่น ถูก "ออกจากระบบทุกอุปกรณ์" จากเครื่องอื่น)
export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  const user = session
    ? { id: session.user.id, name: session.user.name, email: session.user.email }
    : null;

  const res = NextResponse.json({ user });
  res.headers.set("Cache-Control", "no-store");

  // cookie ยังอยู่แต่ session ถูกลบแล้ว -> ล้าง cookie ให้ proxy พาไปหน้า login ได้
  if (!session && request.cookies.has(SESSION_COOKIE)) {
    res.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
  return res;
}
