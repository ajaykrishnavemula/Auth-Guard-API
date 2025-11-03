import { StatusCodes } from 'http-status-codes';

class CustomAPIError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, CustomAPIError.prototype);
  }
}

export class BadRequestError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.BAD_REQUEST);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class NotFoundError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.NOT_FOUND);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthenticatedError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.UNAUTHORIZED);
    Object.setPrototypeOf(this, UnauthenticatedError.prototype);
  }
}

export class ForbiddenError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.FORBIDDEN);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class ConflictError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.CONFLICT);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class TooManyRequestsError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.TOO_MANY_REQUESTS);
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}

export default CustomAPIError;

