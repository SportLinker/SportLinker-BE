'use strict'

const { BadRequestError } = require('../core/error.response')

class PaymentService {
    // init strategies
    paymentStrategies = {
        booking: {
            bank: this.bankPayment,
        },
        premium: {
            bank: this.bankPayment,
        },
    }
}

module.exports = new PaymentService()
