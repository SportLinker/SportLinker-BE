const { asyncHandler } = require('../helpers/asyncHandler.helper')

const HEADER = {
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization', // access token
    REFRESHTOKEN: 'refreshToken', // refresh token
}

const authentication = asyncHandler(async (req, res, next) => {})

module.exports = {
    authentication,
}
