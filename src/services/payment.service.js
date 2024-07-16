'use strict'

const { BadRequestError } = require('../core/error.response')
const prisma = require('../configs/prisma.config').client
const payos = require('../configs/payos.config').payment
const { bankQRLink } = require('../helpers/payment.helper')
const NotificationService = require('./notification.service')

class PaymentService {
    // init strategies for create payment
    paymentStrategies = {
        deposit: {
            momo: 'momo',
            bank: this.depositBank,
        },
        withdraw: {
            momo: 'momo',
            bank: this.withdrawBank,
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
        // check if code is exist
        const isExist = await prisma.transaction.findFirst({
            where: {
                transaction_code: code,
            },
        })
        if (isExist) {
            return this.depositBank(userId, body)
        }
        // create transaction
        const transaction = await prisma.transaction
            .create({
                data: {
                    user_id: userId,
                    transaction_code: code,
                    amount: body.amount,
                    status: 'pending',
                    type: 'deposit',
                    method: 'bank',
                    expired_at: new Date(new Date().getTime() + 5 * 60000),
                },
            })
            .catch((err) => {
                console.log(err)
                global.logger.error(`Create transaction error: ${err.message}`)
            })
        // create payment qr code for bank
        const qrLink = bankQRLink(body.amount, code)

        return {
            transaction_code: code,
            qr_link: qrLink,
            expired_at: transaction.expired_at,
        }
    }

    async handleSuccessDepositPaymentBank(transaction_code) {
        // find transaction by code
        const transaction = await prisma.transaction.findFirst({
            where: {
                transaction_code: transaction_code,
            },
        })
        // update transaction status
        if (!transaction) {
            global.logger.error(`Transaction not found: ${transaction_code}`)
            return
        }
        if (transaction.status !== 'pending') {
            global.logger.error(
                `Transaction have been completed or expired: ${transaction_code}`
            )
            return
        }
        // update transaction status
        await prisma.transaction
            .update({
                where: {
                    id: transaction.id,
                },
                data: {
                    status: 'completed',
                },
            })
            .catch((err) => {
                global.logger.error(`Update transaction status error: ${err.message}`)
            })
        // update user balance
        await prisma.wallet
            .update({
                where: {
                    user_id: transaction.user_id,
                },
                data: {
                    balance: {
                        increment: transaction.amount,
                    },
                },
            })
            .catch((err) => {
                global.logger.error(`Update user balance error: ${err.message}`)
            })
        // send notification to user
        const noti = await NotificationService.createNotification({
            receiver_id: transaction.user_id,
            content: `Nạp tiền vào tài khoản với ${transaction.amount}VND thành công `,
        })

        global.io
            .to(global.onLineUser.get(transaction.user_id))
            .emit('receive-notification', {
                content: noti.content,
            })

        global.logger.info(
            `Deposit ${transaction.amount} to ${transaction.user_id} completed`
        )

        return transaction
    }

    async handleCancelDepositPaymentBank(transaction_code) {
        // find transaction by code
        const transaction = await prisma.transaction.findFirst({
            where: {
                transaction_code: transaction_code,
            },
        })
        // update transaction status
        if (!transaction) {
            throw new BadRequestError('Transaction not found')
        }
        if (transaction.status !== 'pending') {
            throw new BadRequestError('Transaction have been completed or expired')
        }
        // update transaction status
        await prisma.transaction.update({
            where: {
                id: transaction.id,
            },
            data: {
                status: 'cancelled',
            },
        })
        // send notification to user
        await NotificationService.createNotification({
            receiver_id: transaction.user_id,
            content: `Quá trình thanh toán with ${transaction.amount}VND bị hủy`,
        })
        return transaction
    }

    async getPaymentsDetail(transaction_code) {
        const transaction = prisma.transaction.findFirst({
            where: {
                transaction_code: transaction_code,
            },
        })
        return transaction
    }

    async withdrawBank(userId, body) {
        // create code for deposit bank include random 8 char
        const code = Math.random().toString(36).substring(2, 8).toUpperCase()
        // check if code is exist
        const isExist = await prisma.transaction.findFirst({
            where: {
                transaction_code: code,
            },
        })
        if (isExist) {
            return this.withdrawBank(userId, body)
        }
        // check wallet of user
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                Wallet: true,
            },
        })
        if (user.Wallet.balance < body.amount) {
            throw new BadRequestError('Số dư không đủ')
        }
        // create transaction
        const transaction = await prisma.transaction.create({
            data: {
                bank_account: body.bank_account,
                bank_name: body.bank_name,
                bank_short_name: body.bank_short_name,
                user_id: userId,
                amount: body.amount,
                transaction_code: code,
            },
        })
        // update user balance
        await prisma.wallet.update({
            where: {
                user_id: userId,
            },
            data: {
                balance: {
                    decrement: body.amount,
                },
            },
        })
        // send notification to user
        await NotificationService.createNotification({
            receiver_id: userId,
            content: `Rút tiền với số tiền ${body.amount}VND đã được tạo`,
        })
        return transaction
    }
}

module.exports = new PaymentService()
