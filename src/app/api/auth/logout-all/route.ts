import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/container";
import { SESSION_COOKIE } from "@/core/constants/session";
import { requireSession } from "@/lib/auth";
import { errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ message: "Please log in again." }, { status: 401 });
  }

  try {
    await container.logoutAllDevices.execute(session.user.id);
  } catch (error) {
    return errorResponse(error);
  }

  // session ของเครื่องนี้ถูกลบด้วย -> ล้าง cookie
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}