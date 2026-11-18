// The input is valid on its own but can't be applied (e.g. shrinking a plan
// below a day that still has places). `field` lets a form show it next to an input.
export class BadRequestError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = "BadRequestError";
  }
}
