'use strict'

const { CREATED, Ok } = require('../core/sucess.response')
const MatchJoinService = require('../services/matchJoin.service')

class MatchJoinController {
    async joinMatch(req, res, next) {
        new CREATED({
            message: 'Join match successfully, please wait for the owner to accept you.',
            metadata: await MatchJoinService.joinMatch(req.body.match_id, req.user.id),
        }).send(res)
    }
}

module.exports = new MatchJoinController()
