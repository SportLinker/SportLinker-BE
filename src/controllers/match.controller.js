'use strict'

const { CREATED, Ok, NO_CONTENT } = require('../core/sucess.response')
const MatchService = require('../services/match.service')

class MatchController {
    async createNewMatch(req, res, next) {
        new CREATED({
            message: 'Match created successfully',
            metadata: await MatchService.createNewMatch(req.body, req.user.id),
        }).send(res)
    }

    async getMatchByUser(req, res, next) {
        new Ok({
            message: 'Get match by user successfully',
            metadata: await MatchService.getMatchByUser(req.user.id),
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
                req.query.sport_name,
                req.user.id
            ),
        }).send(res)
    }

    async getMatchDetail(req, res, next) {
        new Ok({
            message: 'Get match detail successfully',
            metadata: await MatchService.getMatchDetail(req.params.match_id, req.user.id),
        }).send(res)
    }

    async deleteMatch(req, res, next) {
        new Ok({
            message: 'Delete match successfully',
            metadata: await MatchService.deleteMatch(req.params.match_id, req.user.id),
        }).send(res)
    }

    async updateMatch(req, res, next) {
        new NO_CONTENT({
            message: 'Update match successfully',
            metadata: await MatchService.updateMatch(
                req.params.match_id,
                req.user.id,
                req.body
            ),
        }).send(res)
    }

    async getAllMatchByAdmin(req, res, next) {
        new Ok({
            message: 'Get all match by admin successfully',
            metadata: await MatchService.getAllMatchByAdmin(
                req.query.page_number,
                req.query.page_size,
                req.query.month,
                req.query.year
            ),
        }).send(res)
    }
}

module.exports = new MatchController()
