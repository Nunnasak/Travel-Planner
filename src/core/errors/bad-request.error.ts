export class BadRequestError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = "BadRequestError";
  }
}
