export class UnauthorizedError extends Error {
  readonly name = "UnauthorizedError";
  constructor() {
    super("Unauthorized");
  }
}

export class NotFoundError extends Error {
  readonly name = "NotFoundError";
  constructor(message = "Not found") {
    super(message);
  }
}

export class ForbiddenError extends Error {
  readonly name = "ForbiddenError";
  constructor(message = "Forbidden") {
    super(message);
  }
}

export class RateLimitError extends Error {
  readonly name = "RateLimitError";
  constructor(message = "Rate limit exceeded") {
    super(message);
  }
}

export class ServerError extends Error {
  readonly name = "ServerError";
  constructor(message = "Internal server error") {
    super(message);
  }
}
