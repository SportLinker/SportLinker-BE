'use strict'

const { BadRequestError } = require('../core/error.response')
const prisma = require('../configs/prisma.config').client
const payos = require('../configs/payos.config').payment

class PaymentService {
    // init strategies for create payment
    paymentStrategies = {
        deposit: {
            momo: 'momo',
            bank: this.depositBank,
        },
        withdraw: {
            momo: 'momo',
            bank: 'bank',
        },
    }

    async createPayment(userId, body, type, method) {
        return this.paymentStrategies[type][method](userId, body)
    }

    /**
     * get payment
     * @param {*} userId
     * @param {*} body
     * @logics
     * 1. create code for deposit bank include random 8 char
     * 2. create transaction
     * 3. expire time after five minutes return number
     * 4. create payment for bank
     * 5. update transaction code
     * @returns
     *
     */

    async depositBank(userId, body) {
        // create code for deposit bank include random 8 char
        const code = Math.random().toString(36).substring(2, 8).toUpperCase()
        // create transaction
        const transaction = await prisma.transaction.create({
            data: {
                user_id: userId,
                amount: body.amount,
                status: 'pending',
                type: 'deposit',
                method: 'bank',
            },
        })
        // expire time after five minutes return number
        // create payment for bank
        const result = await payos.createPaymentLink({
            amount: body.amount,
            orderCode: Math.floor(Math.random() * 1000) + 1,
            description: code,
            cancelUrl: `${global.config.get(`PAYMENT_RETURN_URL`)}/${
                transaction.id
            }?status=cancelled`,
            returnUrl: `${global.config.get(`PAYMENT_RETURN_URL`)}/${
                transaction.id
            }?status=completed`,
            expiredAt: Math.floor(Date.now() / 1000) + 300,
            signature: transaction.id,
            items: [],
        })
        // update transaction code
        await prisma.transaction.update({
            where: {
                id: transaction.id,
            },
            data: {
                transaction_code: result.description,
            },
        })
        return result
    }

    getPaymentStrategies = {
        complete: this.completePayment,
        cancelled: this.cancelPayment,
    }

    async getPayment(transactionId, status) {
        return this.getPaymentStrategies[status](transactionId)
    }

    async completePayment(transactionId) {
        // find transaction
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: transactionId,
            },
        })
        // update transaction status
        await prisma.transaction.update({
            where: {
                id: transactionId,
            },
            data: {
                status: 'completed',
            },
        })
        // update user balance
        await prisma.wallet.update({
            where: {
                user_id: transaction.user_id,
            },
            data: {
                balance: {
                    increment: transaction.amount,
                },
            },
        })
        // send notification to user
        await prisma.notification.create({
            data: {
                receiver_id: transaction.user_id,
                sender_id: `clwxu3soj000014ox8yfejzg3`,
                content: `Add money to wallet successfully with ${transaction.amount} VND`,
            },
        })
        return transaction
    }

    async cancelPayment(transactionId) {
        return await prisma.transaction.findUnique({
            where: {
                id: transactionId,
            },
        })
    }
}

module.exports = new PaymentService()
