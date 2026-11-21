import { NextResponse, type NextRequest } from "next/server";
import { shareService } from "@/infrastructure/container";
import { errorResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { parseRouteId } from "@/lib/route-params";

type Context = { params: Promise<{ scheduleId: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    const userId = await requireUserId();
    const id = parseRouteId((await context.params).scheduleId, "Plan not found.");
    return NextResponse.json(await shareService.getSharing(id, userId));
  } catch (error) {
    return errorResponse(error);
  }
}
