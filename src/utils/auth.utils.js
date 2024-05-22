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
        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error('Verify error::', err)
            } else {
                console.log('decode::', decode)
            }
        })

        return {
            accessToken,
            refreshToken,
        }
    } catch (error) {}
}

module.exports = {
    createTokenPair,
}
