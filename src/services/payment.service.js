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

    async createPayment(type, amount) {
        return paymentStrategies[type](amount)
    }

    /**
     *
     */

    /**
     *
     */
}

module.exports = new PaymentService()
