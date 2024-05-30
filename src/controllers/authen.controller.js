'use strict'

const { CREATED, Ok } = require('../core/sucess.response')
const AuthenService = require('../services/authen.service')

class AuthenController {
    async login(req, res, next) {
        new Ok({
            message: 'Login sucessfully',
            metadata: await AuthenService.login(req.body, req.query.type),
        }).send(res)
    }

    async register(req, res, next) {
        new CREATED({
            message: 'Register sucessfully',
            metadata: await AuthenService.register(req.body, req.query.type),
        }).send(res)
    }

    async logout(req, res, next) {
        new Ok({
            message: 'Logout OK',
            metadata: await AuthenService.logout(req.user.id),
        }).send(res)
    }
}

module.exports = new AuthenController()
