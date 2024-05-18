'use strict'
const prisma = require('../configs/prisma.config').client

class AuthenService {
    loginStrategies = {
        email: this.loginWithEmail,
        google: this.loginWithGoogle,
    }

    static login = async (user, typeLogin) => {
        return await this.loginStrategies[typeLogin](user)
    }

    loginWithGoogle = async (user) => {
        // return await AuthenService.login(user, 'google')
        return 'google'
    }

    loginWithPhone = async (user) => {
        // return await AuthenService.login(user, 'phone')
        return 'phone'
    }
}

module.exports = AuthenService
