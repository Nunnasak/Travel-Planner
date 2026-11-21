import { NextResponse, type NextRequest } from "next/server";
import { scheduleService } from "@/infrastructure/container";
import { errorResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { readJson } from "@/lib/route-params";

export async function GET() {
  try {
    const userId = await requireUserId();
    return NextResponse.json(await scheduleService.listMine(userId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const schedule = await scheduleService.create(userId, await readJson(request));
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
