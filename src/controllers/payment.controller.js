'use strict'

const { CREATED, Ok } = require('../core/sucess.response')
const PaymentService = require('../services/payment.service')

class PaymentController {
    async createNewSport(req, res, next) {
        new CREATED({
            message: 'Sport created successfully',
            metadata: await PaymentService.createPayment(req.body, req.query.type),
        }).send(res)
    }
}

module.exports = new PaymentController()
