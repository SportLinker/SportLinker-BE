'use strict'

const { Ok } = require('../core/sucess.response')
const TransactionService = require('../services/transaction.service')

class TransactionController {
    async getAllTransaction(req, res, next) {
        new Ok({
            message: 'Get all transaction success',
            metadata: await TransactionService.getAllTransaction(),
        }).send(res)
    }

    async updateTransaction(req, res, next) {
        new Ok({
            message: 'Update transaction success',
            metadata: await TransactionService.updateTransaction(
                req.params.transaction_id,
                req.body
            ),
        }).send(res)
    }
}

module.exports = new TransactionController()
