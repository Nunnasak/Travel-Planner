import { NextResponse, type NextRequest } from "next/server";
import { scheduleService } from "@/infrastructure/container";
import { errorResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { parseRouteId } from "@/lib/route-params";

type Context = { params: Promise<{ scheduleId: string }> };

export async function POST(_request: NextRequest, context: Context) {
  try {
    const userId = await requireUserId();
    const id = parseRouteId((await context.params).scheduleId, "Plan not found.");
    return NextResponse.json(await scheduleService.publish(id, userId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    const userId = await requireUserId();
    const id = parseRouteId((await context.params).scheduleId, "Plan not found.");
    await scheduleService.unpublish(id, userId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
