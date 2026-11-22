export interface ImageStorage {
  save(name: string, data: Buffer, contentType: string): Promise<string>;
}
