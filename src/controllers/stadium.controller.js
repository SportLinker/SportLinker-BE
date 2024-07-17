'use strict'

const { CREATED, Ok } = require('../core/sucess.response')
const StadiumService = require('../services/stadium.service')

class StadiumController {
    async createStadium(req, res, next) {
        new CREATED({
            message: 'Stadium created successfully.',
            metadata: await StadiumService.createStadium(req.body, req.user.id),
        }).send(res)
    }

    async getStadiumByPlayer(req, res, next) {
        new Ok({
            message: 'Get stadium by player sucessfully',
            metadata: await StadiumService.getStadiumByPlayer(
                req.query.lat,
                req.query.long
            ),
        }).send(res)
    }

    async getStadiumByOwner(req, res, next) {
        new Ok({
            message: 'Get stadium by owner sucessfully',
            metadata: await StadiumService.getStadiumByOwner(req.user.id),
        }).send(res)
    }

    async getStadiumByAdmin(req, res, next) {
        new Ok({
            message: 'Get stadium by owner sucessfully',
            metadata: await StadiumService.getStadiumByAdmin(
                req.query.page_size,
                req.query.page_number
            ),
        }).send(res)
    }

    async getStadiumById(req, res, next) {
        new Ok({
            message: 'Get stadium by id sucessfully',
            metadata: await StadiumService.getStadiumById(
                req.params.stadium_id,
                req.user.id
            ),
        }).send(res)
    }

    async updateStadium(req, res, next) {
        new Ok({
            message: 'Stadium updated successfully.',
            metadata: await StadiumService.updateStadium(
                req.user.id,
                req.params.stadium_id,
                req.body
            ),
        }).send(res)
    }

    async deleteStadium(req, res, next) {
        new Ok({
            message: 'Stadium deleted successfully.',
            metadata: await StadiumService.deleteStadium(req.params.stadium_id),
        }).send(res)
    }

    async updateStatusStadium(req, res, next) {
        new Ok({
            message: 'Stadium status updated successfully.',
            metadata: await StadiumService.updateStatusStadium(
                req.params.stadium_id,
                req.body
            ),
        }).send(res)
    }

    async createRating(req, res, next) {
        new CREATED({
            message: 'Rating created successfully.',
            metadata: await StadiumService.createRating(
                req.body,
                req.user.id,
                req.params.stadium_id
            ),
        }).send(res)
    }
}

module.exports = new StadiumController()
