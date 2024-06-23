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
            metadata: await StadiumService.getStadiumByAdmin(),
        }).send(res)
    }

    async getStadiumById(req, res, next) {
        new Ok({
            message: 'Get stadium by id sucessfully',
            metadata: await StadiumService.getStadiumById(req.params.stadium_id),
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
}

module.exports = new StadiumController()
