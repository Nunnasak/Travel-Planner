import { NextResponse, type NextRequest } from "next/server";
import { scheduleItemService } from "@/infrastructure/container";
import { errorResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { parseRouteId, readJson } from "@/lib/route-params";

type Context = { params: Promise<{ scheduleId: string }> };

export async function POST(request: NextRequest, context: Context) {
  try {
    const userId = await requireUserId();
    const scheduleId = parseRouteId((await context.params).scheduleId, "Plan not found.");
    const item = await scheduleItemService.addToSchedule(scheduleId, userId, await readJson(request));
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
