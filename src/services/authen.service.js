'use strict'
const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')
const redisClient = require('../configs/redis.config').client
const bcrypt = require('bcrypt')
const authUtil = require('../utils/auth.utils')

class AuthenService {
    loginStrategies = {
        phone: this.loginWithPhone,
        google: this.loginWithGoogle,
        username: this.loginWithPhone,
    }

    registerStrategies = {
        phone: this.registerWithPhone,
        username: this.registerWithUsername,
    }

    forgotPasswordStrategies = {
        phone: this.forgotPasswordWithPhone,
        email: this.forgotPasswordWithEmail,
    }

    // verifyOTPStrategies = {
    //     phone: this.verifyOTPWithPhone,
    //     google: this.verifyOTPWithGoogle,
    // }

    async register(user, typeRegister) {
        return await this.registerStrategies[typeRegister](user)
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

    async registerWithUsername(user) {
        // check username exist
        const usernameExist = await prisma.user.findUnique({
            where: {
                username: user.username,
            },
        })
        if (usernameExist) throw new BadRequestError('Username already exist')
        // generate hash password
        const newPass = await bcrypt.hash(user.password, 8)
        // create user
        const newUser = await prisma.user
            .create({
                data: {
                    username: user.username,
                    password: newPass,
                    name: user.name,
                    gender: user.gender,
                    role: user.role,
                    date_of_birth: user.date_of_birth,
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

    async login(user, typeLogin) {
        return await this.loginStrategies[typeLogin](user)
    }

    async loginWithGoogle(user) {
        //find user by email
        const is_exist_user = await prisma.user.findUnique({
            where: {
                email: user.email,
            },
        })
        // if user exist
        if (is_exist_user) {
            const payload = {
                id: is_exist_user.id,
                name: is_exist_user.name,
                email: is_exist_user.email,
                role: is_exist_user.role,
            }
            const token = await authUtil.createTokenPair(payload)
            // save refreshToken , public key to redis
            await redisClient.set(
                `keyToken:${is_exist_user.id}`,
                JSON.stringify({
                    refreshToken: token.refreshToken,
                    publicKey: token.publicKey,
                })
            )
            // logs
            global.logger.info(`User ${is_exist_user.id} login successfully`)
            return {
                user: is_exist_user,
                token: {
                    accessToken: token.accessToken,
                    refreshToken: token.refreshToken,
                },
            }
        }
        // if user not exist
        const new_user = await prisma.user.create({
            data: {
                ...user,
            },
        })
        // create token
        const payload = {
            id: new_user.id,
            name: new_user.name,
            email: new_user.email,
            role: new_user.role,
        }
        const token = await authUtil.createTokenPair(payload)
        // save refreshToken , public key to redis
        await redisClient.set(
            `keyToken:${new_user.id}`,
            JSON.stringify({
                refreshToken: token.refreshToken,
                publicKey: token.publicKey,
            })
        )
        // logs
        global.logger.info(`User ${new_user.id} login successfully`)
        return {
            user: new_user,
            token: {
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
            },
        }
    }

    async loginWithPhone(user) {
        // check login
        const userExist = await prisma.user.findUnique({
            where: {
                phone: user.phone,
            },
        })
        if (!userExist) throw new BadRequestError('Invalid phone or password.')
        // check active
        if (userExist.status !== 'active')
            throw new BadRequestError('User is not active. Please contact admin.')
        // check password
        const validPass = await bcrypt.compare(user.password, userExist.password)
        if (!validPass) throw new BadRequestError('Invalid phone or password.')
        // create token
        const payload = {
            id: userExist.id,
            phone: userExist.phone,
            role: userExist.role,
            name: userExist.name,
        }
        const token = await authUtil.createTokenPair(payload)
        // console.log('token::', token)
        // save refreshToken , public key to redis
        await redisClient.set(
            `keyToken:${userExist.id}`,
            JSON.stringify({
                refreshToken: token.refreshToken,
                publicKey: token.publicKey,
            })
        )
        // logs
        global.logger.info(`User ${userExist.id} login successfully`)
        return {
            user: userExist,
            token: {
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
            },
        }
    }

    async loginWithUsername(user) {
        // check login
        const userExist = await prisma.user.findUnique({
            where: {
                username: user.username,
            },
        })
        if (!userExist) throw new BadRequestError('Invalid phone or password.')
        // check active
        if (userExist.status !== 'active')
            throw new BadRequestError('User is not active. Please contact admin.')
        // check password
        const validPass = await bcrypt.compare(user.password, userExist.password)
        if (!validPass) throw new BadRequestError('Invalid phone or password.')
        // create token
        const payload = {
            id: userExist.id,
            username: userExist.username,
            role: userExist.role,
            name: userExist.name,
        }
        const token = await authUtil.createTokenPair(payload)
        // console.log('token::', token)
        // save refreshToken , public key to redis
        await redisClient.set(
            `keyToken:${userExist.id}`,
            JSON.stringify({
                refreshToken: token.refreshToken,
                publicKey: token.publicKey,
            })
        )
        // logs
        global.logger.info(`User ${userExist.id} login successfully`)
        return {
            user: userExist,
            token: {
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
            },
        }
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
