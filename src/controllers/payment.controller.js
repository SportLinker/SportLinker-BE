'use strict'

const { CREATED, Ok } = require('../core/sucess.response')
const PaymentService = require('../services/payment.service')

class PaymentController {
    async createPayment(req, res, next) {
        new CREATED({
            message: 'Create payment successfully',
            metadata: await PaymentService.createPayment(
                req.user.id,
                req.body,
                req.query.type,
                req.query.method
            ),
        }).send(res)
    }

    async getPayment(req, res, next) {
        new Ok({
            message: 'Get payment successfully',
            metadata: await PaymentService.getPayment(
                req.params.transaction_id,
                req.query.status
            ),
        }).send(res)
    }
}

module.exports = new PaymentController()
