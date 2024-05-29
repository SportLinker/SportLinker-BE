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

    async getListMatch(req, res, next) {
        new Ok({
            message: 'Get list match successfully',
            metadata: await MatchService.getListMatch(
                req.query.lat,
                req.query.long,
                req.query.distance,
                req.query.start_time,
                req.query.end_time,
                req.query.sport_name
            ),
        }).send(res)
    }
}

module.exports = new AuthenController()
