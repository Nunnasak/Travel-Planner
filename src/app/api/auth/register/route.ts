import { NextResponse } from "next/server";
import { registerSchema } from "@/core/schema/auth";
import { EmailAlreadyExistsError } from "@/core/errors/auth";
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
    if (error instanceof EmailAlreadyExistsError) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}