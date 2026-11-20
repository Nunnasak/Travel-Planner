import { NextRequest, NextResponse } from "next/server";
import { updateUsernameSchema } from "@/core/schema/auth";
import { DuplicateFieldsError } from "@/core/errors/auth";
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

  const parsed = updateUsernameSchema.safeParse(json);
  if (!parsed.success) return errorResponse(parsed.error);

  try {
    const user = await container.updateUsername.execute(session.user.id, parsed.data);
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof DuplicateFieldsError) {
      return NextResponse.json(
        {
          message: "Username already exists",
          errors: { username: "This username is already taken." },
        },
        { status: 409 }
      );
    }
    return errorResponse(error);
  }
}