export type ProcessedImage = { data: Buffer; contentType: string; extension: string };

export interface ImageProcessor {
  toWeb(data: Buffer): Promise<ProcessedImage>;
}
