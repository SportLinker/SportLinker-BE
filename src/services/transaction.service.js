'use strict'

const { BadRequestError } = require('../core/error.response')
const prisma = require('../configs/prisma.config').client
const NotificationService = require('./notification.service')

class TransactionService {
    async getAllTransaction() {
        const transactions = await prisma.transaction.findMany({
            select: {
                id: true,
                transaction_code: true,
                amount: true,
                bank_account: true,
                bank_name: true,
                bank_short_name: true,
                rejected_reason: true,
                type: true,
                method: true,
                status: true,
                created_at: true,
                expired_at: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar_url: true,
                    },
                },
            },
            orderBy: [
                {
                    type: 'desc',
                },
                {
                    status: 'asc',
                },
                {
                    created_at: 'desc',
                },
            ],
        })
        return transactions
    }

    async updateTransaction(transaction_id, data) {
        // find transaction by id
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: transaction_id,
                status: 'rejected',
            },
        })
        // update transaction status
        if (data.status === 'rejected') {
            if (!data.rejected_reason) {
                throw new BadRequestError(`Rejected reason is required`)
            }
            await prisma.transaction.update({
                where: {
                    id: transaction_id,
                },
                data: {
                    status: data.status,
                    rejected_reason: data.rejected_reason,
                },
            })
            // send notification to user
            await NotificationService.createNotification({
                content: `Your transaction ${transaction.transaction_code} has been rejected with reason: ${data.rejected_reason}`,
                receiver_id: transaction.user_id,
                sender_id: global.config.get(`ADMIN_ID`),
            })
        }

        if (data.status === 'completed') {
            await prisma.transaction.update({
                where: {
                    id: transaction_id,
                },
                data: {
                    status: data.status,
                },
            })
            // send notification to user
            await NotificationService.createNotification({
                content: `Your transaction ${transaction.transaction_code} has been completed`,
                receiver_id: transaction.user_id,
                sender_id: global.config.get(`ADMIN_ID`),
            })
        }

        return transaction
    }
}

module.exports = new TransactionService()
