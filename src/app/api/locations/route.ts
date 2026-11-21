import { NextResponse, type NextRequest } from "next/server";
import { locationService } from "@/infrastructure/container";
import { errorResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";
import { readJson } from "@/lib/route-params";

export async function GET(request: NextRequest) {
  try {
    await requireUserId();
    const params = Object.fromEntries(request.nextUrl.searchParams);
    return NextResponse.json(await locationService.search(params));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUserId();
    const location = await locationService.create(await readJson(request));
    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
