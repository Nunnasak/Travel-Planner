import { NextResponse, type NextRequest } from "next/server";
import { shareService } from "@/infrastructure/container";
import { errorResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { parseRouteId, readJson } from "@/lib/route-params";

type Context = { params: Promise<{ scheduleId: string; userId: string }> };

async function ids(context: Context) {
  const params = await context.params;
  return {
    scheduleId: parseRouteId(params.scheduleId, "Plan not found."),
    memberId: parseRouteId(params.userId, "That person doesn't have access to this plan."),
  };
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const userId = await requireUserId();
    const { scheduleId, memberId } = await ids(context);
    return NextResponse.json(await shareService.updateMember(scheduleId, userId, memberId, await readJson(request)));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    const userId = await requireUserId();
    const { scheduleId, memberId } = await ids(context);
    return NextResponse.json(await shareService.removeMember(scheduleId, userId, memberId));
  } catch (error) {
    return errorResponse(error);
  }
}
