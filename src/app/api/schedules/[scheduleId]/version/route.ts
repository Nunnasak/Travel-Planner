import { NextResponse, type NextRequest } from "next/server";
import { scheduleService } from "@/infrastructure/container";
import { errorResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { parseRouteId } from "@/lib/route-params";

type Context = { params: Promise<{ scheduleId: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    const userId = await requireUserId();
    const id = parseRouteId((await context.params).scheduleId, "Plan not found.");
    const version = await scheduleService.getVersion(id, userId);
    return NextResponse.json({ version }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
