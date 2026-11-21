import { NextResponse, type NextRequest } from "next/server";
import { shareService } from "@/infrastructure/container";
import { errorResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { parseRouteId, readJson } from "@/lib/route-params";

type Context = { params: Promise<{ scheduleId: string }> };

export async function POST(request: NextRequest, context: Context) {
  try {
    const userId = await requireUserId();
    const id = parseRouteId((await context.params).scheduleId, "Plan not found.");
    return NextResponse.json(await shareService.addMember(id, userId, await readJson(request)), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
