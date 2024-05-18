'use strict'

const StatusCode = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
}

const ReasonStatusCode = {
    BAD_REQUEST: 'Bad request',
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    NOT_FOUND: 'Not found',
    CONFLICT: 'Conflict',
}

class ErrorResponse extends Error {
    constructor(message, statusCode, reasonStatusCode) {
        super(message)
        this.statusCode = statusCode
        this.reasonStatusCode = reasonStatusCode
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(
        message,
        statusCode = StatusCode.CONFLICT,
        reasonStatusCode = ReasonStatusCode.CONFLICT
    ) {
        super(message, statusCode, reasonStatusCode)
    }
}

class BadRequestError extends ErrorResponse {
    constructor(
        message,
        statusCode = StatusCode.BAD_REQUEST,
        reasonStatusCode = ReasonStatusCode.BAD_REQUEST
    ) {
        super(message, statusCode, reasonStatusCode)
    }
}

class UnauthorizedError extends ErrorResponse {
    constructor(
        message,
        statusCode = StatusCode.UNAUTHORIZED,
        reasonStatusCode = ReasonStatusCode.UNAUTHORIZED
    ) {
        super(message, statusCode, reasonStatusCode)
    }
}

class ForbiddenError extends ErrorResponse {
    constructor(
        message,
        statusCode = StatusCode.FORBIDDEN,
        reasonStatusCode = ReasonStatusCode.FORBIDDEN
    ) {
        super(message, statusCode, reasonStatusCode)
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
}
