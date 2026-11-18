import { NextResponse, type NextRequest } from "next/server";
import { locationService } from "@/infrastructure/container";
import { errorResponse } from "@/lib/api-response";
import { parseRouteId } from "@/lib/route-params";

type Context = { params: Promise<{ provinceId: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    const provinceId = parseRouteId((await context.params).provinceId, "Province not found.");
    return NextResponse.json(await locationService.listCities(provinceId));
  } catch (error) {
    return errorResponse(error);
  }
}
