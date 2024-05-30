'use strict'

const { CREATED, Ok } = require('../core/sucess.response')
const SportSerive = require('../services/sport.service')

class SportController {
    async createNewSport(req, res, next) {
        new CREATED({
            message: 'Sport created successfully',
            metadata: await SportSerive.createNewSport(req.body.sport_name),
        }).send(res)
    }

    async getListSport(req, res, next) {
        new Ok({
            message: 'Get list sport successfully',
            metadata: await SportSerive.getListSport(),
        }).send(res)
    }
}

module.exports = new SportController()
