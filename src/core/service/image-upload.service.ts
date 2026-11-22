import { randomBytes } from "node:crypto";
import { BadRequestError } from "../errors/bad-request.error";
import type { ImageProcessor } from "../ports/image-processor";
import type { ImageStorage } from "../ports/image-storage";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function isSupportedImage(data: Buffer) {
  const jpeg = data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  const png = data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const webp = data.subarray(0, 4).toString("ascii") === "RIFF" && data.subarray(8, 12).toString("ascii") === "WEBP";
  return jpeg || png || webp;
}

export class ImageUploadService {
  constructor(
    private readonly storage: ImageStorage,
    private readonly processor: ImageProcessor,
  ) {}

  async upload(data: Buffer) {
    if (data.length === 0) throw new BadRequestError("Pick a photo to upload.", "file");
    if (data.length > MAX_UPLOAD_BYTES) throw new BadRequestError("The photo must be 5 MB or smaller.", "file");
    if (!isSupportedImage(data)) throw new BadRequestError("Upload a JPG, PNG or WebP photo.", "file");

    let image;
    try {
      image = await this.processor.toWeb(data);
    } catch {
      throw new BadRequestError("This photo can't be read. Try another file.", "file");
    }

    const name = `${randomBytes(16).toString("hex")}.${image.extension}`;
    return { url: await this.storage.save(name, image.data, image.contentType) };
  }
}
