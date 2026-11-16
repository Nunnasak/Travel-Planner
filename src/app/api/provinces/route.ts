import { NextResponse } from "next/server";
import { discoveryService } from "@/infrastructure/container";
import { errorResponse } from "@/lib/api-response";

// GET /api/provinces
export async function GET() {
  try {
    return NextResponse.json(await discoveryService.listProvinces());
  } catch (error) {
    return errorResponse(error);
  }
}