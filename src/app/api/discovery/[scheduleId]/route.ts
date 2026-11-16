import { NextResponse, type NextRequest } from "next/server";
import { NotFoundError } from "@/core/errors/not-found.error";
import { discoveryService } from "@/infrastructure/container";
import { errorResponse } from "@/lib/api-response";

// GET /api/discovery/:scheduleId  (public plans only)
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const { scheduleId } = await context.params;
    const id = Number(scheduleId);
    if (!Number.isInteger(id) || id < 1) throw new NotFoundError("Plan not found.");
    return NextResponse.json(await discoveryService.getPublic(id));
  } catch (error) {
    return errorResponse(error);
  }
}