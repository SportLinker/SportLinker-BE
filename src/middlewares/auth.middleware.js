const { asyncHandler } = require('../helpers/asyncHandler.helper')
const { ForbiddenError, UnauthorizedError } = require('../core/error.response')
const redis = require('../configs/redis.config').client

const HEADER = {
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization', // access token
    REFRESHTOKEN: 'refreshToken', // refresh token
}

const authentication = asyncHandler(async (req, res, next) => {
    // check if client ID exists
    const clientId = req.headers[HEADER.CLIENT_ID]
    if (!clientId)
        throw new ForbiddenError('Middleware Error: Client ID is required')
    // check if access token exists
    const keyUser = redis.get(`keyToken:${clientId}`)
    if (!keyUser)
        throw new UnauthorizedError('Middleware Error: Client ID is invalid')
    // check if access token exists
    if (req.headers[HEADER.REFRESHTOKEN]) {
        try {
            // get refresh token
            const refreshToken = req.headers[HEADER.REFRESHTOKEN]
            // decode refresh token
            const decodeUser = JWT.verify(refreshToken, keyUser.publicKey)
            // check if client ID match
            if (clientId !== decodeUser.id)
                throw new UnauthorizedError('Middleware Error: ID not match')
            // set req
            req.user = decodeUser
            return next()
        } catch (error) {
            throw error
        }
    }

    // verify access token
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken)
        throw new UnauthorizedError('Middleware Error: You need to login first')
    try {
        // decode access token
        const decodeUser = JWT.verify(accessToken, keyUser.publicKey)
        // check if client ID match
        if (clientId !== decodeUser.id)
            throw new UnauthorizedError('Invalid userId')
        // set req
        req.user = decodeUser
        return next()
    } catch (error) {
        throw error
    }
})

module.exports = {
    authentication,
}
