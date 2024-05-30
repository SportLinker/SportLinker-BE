'use strict'

const StatusCode = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
}

const ReasonStatusCode = {
    OK: 'OK',
    CREATED: 'Created',
    ACCEPTED: 'Accepted',
    NO_CONTENT: 'No Content',
}
class SuccessResponse {
    constructor({
        message,
        code = StatusCode.OK,
        status = ReasonStatusCode.OK,
        metadata = {},
    }) {
        this.message = !message ? status : message
        this.code = code
        this.status = status
        this.metadata = metadata
    }

    send(res, header = {}) {
        return res.status(this.code).json(this)
    }
}

class Ok extends SuccessResponse {
    constructor({ message, metadata }) {
        super({ message, metadata })
    }
}

class CREATED extends SuccessResponse {
    constructor({
        message,
        code = StatusCode.CREATED,
        status = ReasonStatusCode.CREATED,
        metadata,
        options = {},
    }) {
        super({ message, code, status, metadata })
        this.options = options
    }
}

class ACCEPTED extends SuccessResponse {
    constructor({
        message,
        code = StatusCode.ACCEPTED,
        status = ReasonStatusCode.ACCEPTED,
        metadata,
        options = {},
    }) {
        super({ message, code, status, metadata })
        this.options = options
    }
}

class NO_CONTENT extends SuccessResponse {
    constructor({
        message,
        code = StatusCode.NO_CONTENT,
        status = ReasonStatusCode.NO_CONTENT,
        metadata,
        options = {},
    }) {
        super({ message, code, status, metadata })
        this.options = options
    }
}

module.exports = {
    Ok,
    CREATED,
    ACCEPTED,
    NO_CONTENT,
}
