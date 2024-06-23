'use strict'

const { CREATED, Ok } = require('../core/sucess.response')
const YardService = require('../services/yard.service')

class YardController {
    async createYard(req, res, next) {
        new CREATED({
            message: 'Yard created successfully.',
            metadata: await YardService.createYard(req.body, req.params.stadium_id),
        }).send(res)
    }

    async getListYardByUser(req, res, next) {
        new Ok({
            message: 'Yards fetched successfully.',
            metadata: await YardService.getListYardByUser(req.params.stadium_id),
        }).send(res)
    }

    async getListYardByOwner(req, res, next) {
        new Ok({
            message: 'Yards fetched successfully.',
            metadata: await YardService.getListYardByOwner(req.params.stadium_id),
        }).send(res)
    }

    async getYardById(req, res, next) {
        new Ok({
            message: 'Yard fetched successfully.',
            metadata: await YardService.getYardById(req.params.yard_id),
        }).send(res)
    }

    async updateYard(req, res, next) {
        new Ok({
            message: 'Yard updated successfully.',
            metadata: await YardService.updateYard(req.params.yard_id, req.body),
        }).send(res)
    }

    async deleteYard(req, res, next) {
        new Ok({
            message: 'Yard deleted successfully.',
            metadata: await YardService.deleteYard(req.params.yard_id),
        }).send(res)
    }
}

module.exports = new YardController()
