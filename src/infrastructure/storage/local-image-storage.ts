import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ImageStorage } from "@/core/ports/image-storage";
import { UPLOAD_NAME_PATTERN, UPLOAD_PATH } from "@/core/schema/image.schema";

export class LocalImageStorage implements ImageStorage {
  constructor(private readonly dir: string) {}

  async save(name: string, data: Buffer) {
    if (!UPLOAD_NAME_PATTERN.test(name)) throw new Error(`Invalid upload name: ${name}`);
    await mkdir(this.dir, { recursive: true });
    await writeFile(path.join(this.dir, name), data, { flag: "wx" });
    return `${UPLOAD_PATH}${name}`;
  }

  async read(name: string) {
    if (!UPLOAD_NAME_PATTERN.test(name)) return null;
    try {
      return await readFile(path.join(this.dir, name));
    } catch {
      return null;
    }
  }
}
