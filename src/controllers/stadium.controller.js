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

    async getStadiums(req, res, next) {
        new OK({
            message: 'Stadiums fetched successfully.',
            metadata: await StadiumService.getStadiums(
                req.user.id,
                req.user.role,
                req.query.lat,
                req.query.long
            ),
        }).send(res)
    }
}

module.exports = new StadiumController()
