'use strict'

const { CREATED, Ok } = require('../core/sucess.response')
const MatchService = require('../services/match.service')

class AuthenController {
    async createNewMatch(req, res, next) {
        new CREATED({
            message: 'Match created successfully',
            metadata: await MatchService.createNewMatch(req.body, req.user.id),
        }).send(res)
    }
}

module.exports = new AuthenController()
