import { NextRequest, NextResponse } from "next/server";
import { deleteAccountSchema } from "@/core/schema/auth";
import { InvalidCredentialsError } from "@/core/errors/auth";
import { container } from "@/infrastructure/container";
import { SESSION_COOKIE } from "@/core/constants/session";
import { requireSession } from "@/lib/auth";
import { errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ message: "Please log in again." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = deleteAccountSchema.safeParse(json);
  if (!parsed.success) return errorResponse(parsed.error);

  try {
    await container.deleteAccount.execute(session.user.id, parsed.data);
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json(
        {
          message: "Password is incorrect.",
          errors: { password: "Password is incorrect." },
        },
        { status: 400 }
      );
    }
    return errorResponse(error);
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