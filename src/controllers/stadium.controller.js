'use strict'

const { CREATED } = require('../core/sucess.response')
const StadiumService = require('../services/stadium.service')

class StadiumController {
    async createStadium(req, res, next) {
        new CREATED({
            message: 'Stadium created successfully.',
            metadata: await StadiumService.createStadium(req.body, req.user.id),
        }).send(res)
    }

    async getStadiumByPlayer(req, res, next) {
        new OK({
            message: 'Get stadium by player sucessfully',
            metadata: await StadiumService.getStadiums(req.query.lat, req.query.long),
        }).send(res)
    }

    async getStadiumByOnwer(req, res, next) {
        new OK({
            message: 'Get stadium by onwer sucessfully',
            metadata: await StadiumService.getStadiumByOnwer(req.user.id),
        }).send(res)
    }

    async getStadiumByAdmin(req, res, next) {
        new OK({
            message: 'Get stadium by onwer sucessfully',
            metadata: await StadiumService.getStadiumByAdmin(),
        }).send(res)
    }
}

module.exports = new StadiumController()
