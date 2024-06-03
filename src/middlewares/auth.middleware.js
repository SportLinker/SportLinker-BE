const { asyncHandler } = require('../helpers/asyncHandler.helper')
const { ForbiddenError, UnauthorizedError } = require('../core/error.response')
const redis = require('../configs/redis.config').client
const JWT = require('jsonwebtoken')
const { error } = require('winston')

const HEADER = {
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization', // access token
    REFRESHTOKEN: 'refresh', // refresh token
}

const authentication = asyncHandler(async (req, res, next) => {
    // check if client ID exists
    const clientId = req.headers[HEADER.CLIENT_ID]
    if (!clientId) throw new UnauthorizedError('Middleware Error: Client ID is required')
    // check if access token exists
    let keyUser = await redis.get(`keyToken:${clientId}`)
    if (!keyUser) throw new UnauthorizedError('Middleware Error: Client ID is invalid')
    // parse key to object
    keyUser = JSON.parse(keyUser)
    // check if refresh token exists
    if (req.headers[HEADER.REFRESHTOKEN]) {
        try {
            // get refresh token
            const refreshToken = req.headers[HEADER.REFRESHTOKEN]
            // decode refresh token
            const decodeUser = JWT.verify(
                refreshToken,
                keyUser.publicKey,
                (err, decode) => {
                    if (err)
                        throw new UnauthorizedError('Middleware Error: Invalid token')
                    return decode
                }
            )
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
        const decodeUser = await JWT.verify(accessToken, keyUser.publicKey)
        if (!decodeUser) throw new UnauthorizedError('Middleware Error: Invalid token')
        // check if client ID match
        if (clientId !== decodeUser.id) throw new UnauthorizedError('Invalid userId')
        // set req
        req.user = decodeUser
        return next()
    } catch (error) {
        throw error
    }
})

const authorization = asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'admin')
        throw new ForbiddenError('Middleware Error: You are not authorized')
    return next()
})

module.exports = {
    authentication,
}
