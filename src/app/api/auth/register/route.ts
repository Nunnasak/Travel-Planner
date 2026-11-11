import { NextResponse } from "next/server";
import { registerSchema } from "@/core/schema/auth";
import { EmailAlreadyExistsError, UsernameAlreadyExistsError, DuplicateFieldsError } from "@/core/errors/auth";
import { container } from "@/infrastructure/container";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const user = await container.registerUser.execute(parsed.data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateFieldsError) {
      const errors: Record<string, string> = {};
      if (error.fields.email) errors.email = "This email is already registered.";
      if (error.fields.username) errors.username = "This username is already taken.";

      return NextResponse.json(
        { message: "Email or username already exists", errors },
        { status: 409 }
      );
    }
    
    if (error instanceof EmailAlreadyExistsError) {
      return NextResponse.json(
        {
          message: "Email already exists",
          errors: { email: "This email is already registered." },
        },
        { status: 409 }
      );
    }

    if (error instanceof UsernameAlreadyExistsError) {
      return NextResponse.json(
        {
          message: "Username already exists",
          errors: { username: "This username is already taken." },
        },
        { status: 409 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}