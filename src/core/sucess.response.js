'use strict'

const StatusCode = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204
}

const ReasonStatusCode = {
    OK: 'OK',
    CREATED: 'Created',
    ACCEPTED: 'Accepted',
    NO_CONTENT: 'No Content'

}
class SuccessResponse {
    constructor({ message, statusCode = StatusCode.OK, reasonStatusCode = ReasonStatusCode.OK, metadata = {} }) {
        this.message = !message ? reasonStatusCode : message;
        this.statusCode = statusCode;
        this.reasonStatusCode = reasonStatusCode;
        this.metadata = metadata;
    }

    send(res, header = {}) {
        return res.status(this.statusCode).json(this);
    }
}

class Ok extends SuccessResponse {
    constructor({ message, metadata }) {
        super({ message, metadata })
    }
}

class CREATED extends SuccessResponse {
    constructor({
        message, statusCode = StatusCode.CREATED,
        reasonStatusCode = ReasonStatusCode.CREATED,
        metadata,
        options = {}
    }) {
        super({ message, statusCode, reasonStatusCode, metadata })
        this.options = options;
    }
}

class ACCEPTED extends SuccessResponse {
    constructor({
        message, statusCode = StatusCode.ACCEPTED,
        reasonStatusCode = ReasonStatusCode.ACCEPTED,
        metadata,
        options = {}
    }) {
        super({ message, statusCode, reasonStatusCode, metadata })
        this.options = options;
    }
}

class NO_CONTENT extends SuccessResponse {
    constructor({
        message, statusCode = StatusCode.NO_CONTENT,
        reasonStatusCode = ReasonStatusCode.NO_CONTENT,
        metadata,
        options = {}
    }) {
        super({ message, statusCode, reasonStatusCode, metadata })
        this.options = options;
    }
}

module.exports = {
    Ok,
    CREATED,
    ACCEPTED,
    NO_CONTENT
}