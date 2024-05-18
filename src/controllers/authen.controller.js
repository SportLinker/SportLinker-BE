'use strict'

const { CREATED, Ok } = require('../core/sucess.response')
const AuthenService = require('../services/access.service')

class AuthenController {
    logout = async (req, res, next) => {
        new Ok({
            message: 'Logout OK',
            metadata: await AuthenService.logout({ keyStore: req.keyStore }),
        }).send(res)
    }

    register = async (req, res, next) => {
        new CREATED({
            message: 'Register OK',
            metadata: await AuthenService.register(req.body),
        }).send(res)
    }
}

module.exports = new AuthenController()
