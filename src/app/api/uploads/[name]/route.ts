import { NextResponse, type NextRequest } from "next/server";
import { imageStorage } from "@/infrastructure/container";

type Context = { params: Promise<{ name: string }> };

export async function GET(_request: NextRequest, context: Context) {
  const { name } = await context.params;
  const data = await imageStorage.read(name);
  if (!data) return NextResponse.json({ message: "Image not found." }, { status: 404 });
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
