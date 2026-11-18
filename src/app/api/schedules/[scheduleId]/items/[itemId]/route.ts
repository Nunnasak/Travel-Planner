import { NextResponse, type NextRequest } from "next/server";
import { scheduleItemService } from "@/infrastructure/container";
import { errorResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { parseRouteId, readJson } from "@/lib/route-params";

type Context = { params: Promise<{ scheduleId: string; itemId: string }> };

async function ids(context: Context) {
  const params = await context.params;
  return {
    scheduleId: parseRouteId(params.scheduleId, "Plan not found."),
    itemId: parseRouteId(params.itemId, "Place not found in this plan."),
  };
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const userId = await requireUserId();
    const { scheduleId, itemId } = await ids(context);
    const item = await scheduleItemService.editInSchedule(
      scheduleId,
      itemId,
      userId,
      await readJson(request),
    );
    return NextResponse.json(item);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    const userId = await requireUserId();
    const { scheduleId, itemId } = await ids(context);
    await scheduleItemService.removeFromSchedule(scheduleId, itemId, userId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
