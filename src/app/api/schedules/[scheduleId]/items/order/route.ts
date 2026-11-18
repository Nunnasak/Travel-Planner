import { NextResponse, type NextRequest } from "next/server";
import { scheduleItemService } from "@/infrastructure/container";
import { errorResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { parseRouteId, readJson } from "@/lib/route-params";

type Context = { params: Promise<{ scheduleId: string }> };

export async function PUT(request: NextRequest, context: Context) {
  try {
    const userId = await requireUserId();
    const scheduleId = parseRouteId((await context.params).scheduleId, "Plan not found.");
    return NextResponse.json(
      await scheduleItemService.reorder(scheduleId, userId, await readJson(request)),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
