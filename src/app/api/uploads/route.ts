import { NextResponse, type NextRequest } from "next/server";
import { BadRequestError } from "@/core/errors/bad-request.error";
import { MAX_UPLOAD_BYTES } from "@/core/service/image-upload.service";
import { imageUploadService } from "@/infrastructure/container";
import { errorResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await requireUserId();
    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > MAX_UPLOAD_BYTES + 64 * 1024) {
      throw new BadRequestError("The photo must be 5 MB or smaller.", "file");
    }
    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) throw new BadRequestError("Pick a photo to upload.", "file");
    if (file.size > MAX_UPLOAD_BYTES) throw new BadRequestError("The photo must be 5 MB or smaller.", "file");

    const result = await imageUploadService.upload(Buffer.from(await file.arrayBuffer()));
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
