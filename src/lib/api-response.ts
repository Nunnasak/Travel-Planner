import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { BadRequestError } from "@/core/errors/bad-request.error";
import { ForbiddenError } from "@/core/errors/forbidden.error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";

// Turns an error into the JSON the frontend forms expect:
//   { message: "..." } or { message: "...", errors: { field: "..." } }
export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    const errors: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return NextResponse.json(
      { message: "Please check your input.", errors },
      { status: 400 }
    );
  }
  if (error instanceof BadRequestError) {
    const errors = error.field ? { [error.field]: error.message } : undefined;
    return NextResponse.json({ message: error.message, errors }, { status: 400 });
  }
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
  console.error(error);
  return NextResponse.json(
    { message: "Something went wrong. Please try again." },
    { status: 500 }
  );
}