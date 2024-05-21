'use strict'

const { CREATED, Ok } = require('../core/sucess.response')
const AuthenService = require('../services/authen.service')

class AuthenController {
    async login(req, res, next) {
        new Ok({
            message: 'Login OK',
            metadata: await AuthenService.login(req.body, req.query.type),
        }).send(res)
    }

    async register(req, res, next) {
        console.log('register')
        new CREATED({
            message: 'Register sucessfully',
            metadata: await AuthenService.register(req.body, req.query.type),
        }).send(res)
    }
}

module.exports = new AuthenController()
