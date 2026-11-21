import { NextRequest, NextResponse } from "next/server";
import { changePasswordSchema } from "@/core/schema/auth";
import { InvalidCredentialsError } from "@/core/errors/auth";
import { container } from "@/infrastructure/container";
import { requireSession } from "@/lib/auth";
import { errorResponse } from "@/lib/api-response";

export async function PATCH(request: NextRequest) {
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

  const parsed = changePasswordSchema.safeParse(json);
  if (!parsed.success) return errorResponse(parsed.error);

  try {
    await container.changePassword.execute(session.user.id, session.token, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json(
        {
          message: "Current password is incorrect.",
          errors: { currentPassword: "Current password is incorrect." },
        },
        { status: 400 }
      );
    }
    return errorResponse(error);
  }
}