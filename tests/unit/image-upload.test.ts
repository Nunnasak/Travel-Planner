import { mkdtemp, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { BadRequestError } from "@/core/errors/bad-request.error";
import { imageUrlSchema } from "@/core/schema/image.schema";
import { ImageUploadService, MAX_UPLOAD_BYTES } from "@/core/service/image-upload.service";
import { LocalImageStorage } from "@/infrastructure/storage/local-image-storage";
import { SharpImageProcessor } from "@/infrastructure/storage/sharp-image-processor";

let dir: string;
let storage: LocalImageStorage;
let service: ImageUploadService;

function photo(width: number, height: number, format: "png" | "jpeg" | "webp" = "png") {
  return sharp({ create: { width, height, channels: 3, background: { r: 25, g: 181, b: 165 } } })
    .toFormat(format)
    .toBuffer();
}

beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "uploads-"));
  storage = new LocalImageStorage(dir);
  service = new ImageUploadService(storage, new SharpImageProcessor());
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("ImageUploadService", () => {
  it.each(["png", "jpeg", "webp"] as const)("stores a %s photo as WebP and returns its URL", async (format) => {
    const { url } = await service.upload(await photo(40, 30, format));

    expect(url).toMatch(/^\/api\/uploads\/[0-9a-f]{32}\.webp$/);
    const saved = await storage.read(url.split("/").pop() ?? "");
    expect(saved).not.toBeNull();
    expect((await sharp(saved!).metadata()).format).toBe("webp");
  });

  it("shrinks large photos to at most 1600px on the long side", async () => {
    const { url } = await service.upload(await photo(3200, 1000));

    const meta = await sharp((await storage.read(url.split("/").pop() ?? ""))!).metadata();
    expect([meta.width, meta.height]).toEqual([1600, 500]);
  });

  it("drops the photo's metadata such as GPS", async () => {
    const withExif = await sharp(await photo(20, 20, "jpeg"))
      .withExif({ IFD0: { Copyright: "secret place" } })
      .jpeg()
      .toBuffer();
    expect((await sharp(withExif).metadata()).exif).toBeDefined();

    const { url } = await service.upload(withExif);

    expect((await sharp((await storage.read(url.split("/").pop() ?? ""))!).metadata()).exif).toBeUndefined();
  });

  it.each([
    ["an empty file", Buffer.alloc(0)],
    ["a text file", Buffer.from("hello, this is not a photo")],
    ["a file that is too big", Buffer.alloc(MAX_UPLOAD_BYTES + 1, 0xff)],
    ["a broken JPEG", Buffer.from([0xff, 0xd8, 0xff, 0x00, 0x01, 0x02])],
  ])("rejects %s and stores nothing", async (_label, data) => {
    await expect(service.upload(data)).rejects.toBeInstanceOf(BadRequestError);
    await expect(readdir(dir)).resolves.toEqual([]);
  });
});

describe("LocalImageStorage.read", () => {
  it.each(["../package.json", "..%2Fpackage.json", "abc.webp", "a".repeat(32) + ".png"])(
    "refuses the name %s",
    async (name) => {
      await expect(storage.read(name)).resolves.toBeNull();
    },
  );
});

describe("imageUrlSchema", () => {
  it.each([
    ["an https link", "https://images.unsplash.com/photo-1"],
    ["an uploaded photo", `/api/uploads/${"a1".repeat(16)}.webp`],
  ])("accepts %s", (_label, value) => {
    expect(imageUrlSchema.parse(value)).toBe(value);
  });

  it("turns an empty value into null", () => {
    expect(imageUrlSchema.parse("")).toBeNull();
  });

  it.each(["/api/uploads/../secret.webp", "/etc/passwd", "not a url", "/api/uploads/abc.webp"])(
    "rejects %s",
    (value) => {
      expect(imageUrlSchema.safeParse(value).success).toBe(false);
    },
  );
});
