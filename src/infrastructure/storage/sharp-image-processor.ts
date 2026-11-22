import sharp from "sharp";
import type { ImageProcessor } from "@/core/ports/image-processor";

const MAX_SIDE = 1600;
const MAX_INPUT_PIXELS = 50_000_000;

export class SharpImageProcessor implements ImageProcessor {
  async toWeb(data: Buffer) {
    const output = await sharp(data, { limitInputPixels: MAX_INPUT_PIXELS })
      .rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    return { data: output, contentType: "image/webp", extension: "webp" };
  }
}
