import { NextResponse } from "next/server";
import { loginSchema } from "@/core/schema/auth";
import { InvalidCredentialsError } from "@/core/errors/auth";
import { container } from "@/infrastructure/container";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const { user, token } = await container.loginUser.execute(parsed.data);

    const res = NextResponse.json({ user });
    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 วัน
    });
    return res;
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}