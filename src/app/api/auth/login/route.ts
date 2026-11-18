import { NextResponse } from "next/server";
import { loginSchema } from "@/core/schema/auth";
import { InvalidCredentialsError } from "@/core/errors/auth";
import { container } from "@/infrastructure/container";
import { SESSION_COOKIE } from "@/core/constants/session";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return NextResponse.json({ message: "Invalid input", errors }, { status: 400 });
  }

  try {
    const { user, token, expiresAt, persistent } = await container.loginUser.execute(parsed.data);

    const res = NextResponse.json({ user });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // ติ๊ก remember → มีวันหมดอายุ, ไม่ติ๊ก → ไม่ใส่ = session cookie
      ...(persistent ? { expires: expiresAt } : {}),
    });
    return res;
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json(
        { message: "Email or password is incorrect." },
        { status: 401 }
      );
    }
    console.error(error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}