'use strict'

const { CREATED, Ok, ACCEPTED } = require('../core/sucess.response')
const MatchJoinService = require('../services/matchJoin.service')

class MatchJoinController {
    async joinMatch(req, res, next) {
        new ACCEPTED({
            message: 'Join match successfully, please wait for the owner to accept you.',
            metadata: await MatchJoinService.joinMatch(req.body.match_id, req.user.id),
        }).send(res)
    }

    async updateUserJoinMatchByMatchId(req, res, next) {
        new Ok({
            message: 'Update user join match by match id successfully.',
            metadata: await MatchJoinService.updateUserJoinMatchByMatchId(
                req.params.match_id,
                req.body,
                req.user.id
            ),
        }).send(res)
    }
}

module.exports = new MatchJoinController()
