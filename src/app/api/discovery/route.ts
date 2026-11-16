import { NextResponse, type NextRequest } from "next/server";
import { discoveryService } from "@/infrastructure/container";
import { errorResponse } from "@/lib/api-response";

// GET /api/discovery?q=&province_id=&category=&days=&page=&page_size=
export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    return NextResponse.json(await discoveryService.list(params));
  } catch (error) {
    return errorResponse(error);
  }
}