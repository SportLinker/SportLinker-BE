'use strict'
const prisma = require('../configs/prisma.config')
const { BadRequestError } = require('../core/error.response')
const redisClient = require('../configs/redis.config').client
const bcrypt = require('bcrypt')

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

    async login(user, typeLogin) {
        return await this.loginStrategies[typeLogin](user)
    }

    async loginWithGoogle(user) {
        // Your Google login logic here
        return 'google'
    }

    async loginWithPhone(user) {
        // Your phone login logic here
        return 'phone'
    }

    async register(user, typeRegister) {
        console.log(user)
        return await this.registerStrategies[typeRegister](user)
    }

    async registerWithGoogle(user) {
        // check email exist
        const emailExist = await prisma.user.findUnique({
            where: {
                email: user.email,
            },
        })
        if (emailExist) throw new BadRequestError('Email already exist')
        // generate hash password
        const newPass = await bcrypt.hash(user.password, 8)
        // create user
        const newUser = await prisma.user.create({
            data: {
                email: user.email,
                password: newPass,
                name: user.name,
                gender: user.gender,
                role: user.role,
            },
        })
        // create redis favorite list of user
        await redisClient.set(
            `favorite:${user.email}`,
            JSON.stringify([user.favorite])
        )
        return newUser
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
        const newUser = await prisma.user.create({
            data: {
                phone: user.phone,
                password: newPass,
                name: user.name,
                gender: user.gender,
                role: user.role,
            },
        })
        if (!newUser) throw new BadRequestError('Register fail')
        // create redis favorite list of user
        await redisClient.set(
            `favorite:${newUser.id}`,
            JSON.stringify([user.favorite])
        )
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

    async logout(user) {
        return 'logout'
    }
}

module.exports = new AuthenService()
