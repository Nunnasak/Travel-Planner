export class EmailAlreadyExistsError extends Error {
  constructor() {
    super("Email already exists");
    this.name = "EmailAlreadyExistsError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials");
    this.name = "InvalidCredentialsError";
  }
}

export class UsernameAlreadyExistsError extends Error {
  constructor() {
    super("Username already exists");
    this.name = "UsernameAlreadyExistsError";
  }
}

export class DuplicateFieldsError extends Error {
  constructor(public fields: { email?: boolean; username?: boolean }) {
    super("Duplicate fields");
    this.name = "DuplicateFieldsError";
  }
}