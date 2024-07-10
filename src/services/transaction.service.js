'use strict'

const { BadRequestError } = require('../core/error.response')
const prisma = require('../configs/prisma.config').client
const NotificationService = require('./notification.service')

class TransactionService {
    async getTransactionByUser(pageSize, pageNumber, user_id) {
        // parse page size and page number
        pageSize = parseInt(pageSize)
        pageNumber = parseInt(pageNumber)
        const transactions = await prisma.transaction.findMany({
            where: {
                user_id: user_id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar_url: true,
                        Wallet: {
                            select: {
                                balance: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                {
                    created_at: 'desc',
                },
            ],
            skip: pageSize * (pageNumber - 1),
            take: pageSize,
        })
        const total_page = Math.ceil((await prisma.transaction.count()) / pageSize)
        return {
            total_page: total_page,
            transactions: transactions,
        }
    }

    async getAllTransaction(pageSize, pageNumber) {
        // parse page size and page number
        pageSize = parseInt(pageSize)
        pageNumber = parseInt(pageNumber)
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
            skip: pageSize * (pageNumber - 1),
            take: pageSize,
        })
        const total_page = Math.ceil((await prisma.transaction.count()) / pageSize)
        return {
            total_page: total_page,
            transactions: transactions,
        }
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
            const noti = await NotificationService.createNotification({
                content: `Giao dịch của bạn ${transaction.transaction_code} đã bị từ chối với lí do: ${data.rejected_reason}`,
                receiver_id: transaction.user_id,
            })
            // emit socket
            global.io
                .to(global.onLineUser.get(transaction.user_id))
                .emit('receive-notification', {
                    content: noti.content,
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
            const noti = await NotificationService.createNotification({
                content: `Giao dịch của bạn với ${transaction.transaction_code} thành công!`,
                receiver_id: transaction.user_id,
            })
            // emit socket
            global.io
                .to(global.onLineUser.get(transaction.user_id))
                .emit('receive-notification', {
                    content: noti.content,
                })
        }

        return transaction
    }
}

module.exports = new TransactionService()
