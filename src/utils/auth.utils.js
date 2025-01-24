const JWT = require('jsonwebtoken')
const crypto = require('node:crypto')

const createTokenPair = (payload) => {
    try {
        // console.log('payload::', payload)
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            },
        })
        // accessToken
        const accessToken = JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '2 days',
        })
        // refreshToken
        const refreshToken = JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '7 days',
        })
        //
        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error('AuthUtils::createTokenPair::decode::', err)
            } else {
                console.log('AuthUtils::createTokenPair::decode::', decode)
            }
        })

        return {
            accessToken,
            refreshToken,
            privateKey,
            publicKey,
        }
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = {
    createTokenPair,
}
