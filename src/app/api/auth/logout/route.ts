import { NextRequest, NextResponse } from "next/server";
import { container } from "@/infrastructure/container";
import { SESSION_COOKIE } from "@/core/constants/session";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  try {
    await container.logoutUser.execute(token);
  } catch (error) {
    console.error(error); // DB ล้ม ก็ยังลบ cookie ต่อ
  }

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