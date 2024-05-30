'use strict'
const prisma = require('../configs/prisma.config')
const { BadRequestError } = require('../core/error.response')
const redisClient = require('../configs/redis.config').client
const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const authUtil = require('../utils/auth.utils')

class AuthenService {
    loginStrategies = {
        phone: this.loginWithPhone,
        google: this.loginWithGoogle,
    }

    registerStrategies = {
        phone: this.registerWithPhone,
        google: this.registerWithGoogle,
    }

    forgotPasswordStrategies = {
        phone: this.forgotPasswordWithPhone,
        email: this.forgotPasswordWithEmail,
    }

    // verifyOTPStrategies = {
    //     phone: this.verifyOTPWithPhone,
    //     google: this.verifyOTPWithGoogle,
    // }

    async login(user, typeLogin) {
        return await this.loginStrategies[typeLogin](user)
    }

    async loginWithGoogle(user) {
        // Your Google login logic here
        return 'google'
    }

    async loginWithPhone(user) {
        // check login
        const userExist = await prisma.user.findUnique({
            where: {
                phone: user.phone,
            },
        })
        if (!userExist) throw new BadRequestError('Invalid phone or password.')
        // check password
        const validPass = await bcrypt.compare(user.password, userExist.password)
        if (!validPass) throw new BadRequestError('Invalid phone or password.')
        // create token
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
        // create payload
        const payload = {
            id: userExist.id,
            phone: userExist.phone,
            role: userExist.role,
            name: userExist.name,
        }
        const token = await authUtil.createTokenPair(payload, privateKey, publicKey)
        console.log('token::', token)
        // save refreshToken , public key to redis
        await redisClient.set(
            `keyToken:${userExist.id}`,
            JSON.stringify({ refreshToken: token.refreshToken, publicKey })
        )
        // logs
        global.logger.info(`User ${userExist.id} login successfully`)
        return {
            user: userExist,
            token: token,
        }
    }

    async register(user, typeRegister) {
        return await this.registerStrategies[typeRegister](user)
    }

    async registerWithGoogle(user) {
        // Your Google register logic here
        return 'google'
    }

    async registerWithPhone(user) {
        // check phone exist
        const phoneExist = await prisma.user.findUnique({
            where: {
                phone: user.phone,
            },
        })
        if (phoneExist) throw new BadRequestError('Phone already exist')
        // generate hash password
        const newPass = await bcrypt.hash(user.password, 8)
        // create user
        const newUser = await prisma.user
            .create({
                data: {
                    phone: user.phone,
                    password: newPass,
                    name: user.name,
                    gender: user.gender,
                    role: user.role,
                    date_of_birth: user.date_of_birth,
                    role: user.role,
                },
            })
            .catch((err) => {
                throw new BadRequestError(err.message)
            })
        // create redis favorite list of user
        await redisClient.set(`favorite:${newUser.id}`, JSON.stringify(user.favorite))
        // logs
        // creat wallet for this user
        await prisma.wallet.create({
            data: {
                user_id: newUser.id,
                balance: 0,
            },
        })
        global.logger.info(`User ${newUser.id} register successfully`)
        return newUser
    }

    // forgot password

    async forgotPassword(user, typeForgotPassword) {
        return await this.forgotPasswordStrategies[typeForgotPassword](user)
    }

    async forgotPasswordWithEmail(user) {
        // Your email forgot password logic here
        return 'email'
    }

    async forgotPasswordWithPhone(user) {
        // Your phone forgot password logic here
        return 'phone'
    }

    async logout(userId) {
        // remove refreshToken from redis
        await redisClient.del(`keyToken:${userId}`)
        // logs
        global.logger.info(`User ${userId} logout successfully`)
        return 'Logout OK'
    }
}

module.exports = new AuthenService()
