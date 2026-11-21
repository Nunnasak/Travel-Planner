export class UnauthorizedError extends Error {
  constructor(message = "Please log in first.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
