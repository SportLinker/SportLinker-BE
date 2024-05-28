const JWT = require('jsonwebtoken')

const createTokenPair = async (payload, privateKey, publicKey) => {
    try {
        console.log('payload::', payload)
        // accessToken
        const accessToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '2 days',
        })
        // refreshToken
        const refreshToken = await JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '7 days',
        })
        console.log('Generated accessToken::', accessToken)
        console.log('Generated refreshToken::', refreshToken)
        //
        await JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error('AuthUtils::createTokenPair::decode::', err)
            } else {
                console.log('AuthUtils::createTokenPair::decode::', decode)
            }
        })

        return {
            accessToken,
            refreshToken,
        }
    } catch (error) {
        throw new Error(error)
    }
}

module.exports = {
    createTokenPair,
}
