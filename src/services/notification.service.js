'use strict'

const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')

class NotificationSerivce {
    async createNotification({ sender_id, receiver_id, content }) {
        return await prisma.notification.create({
            data: {
                sender_id: sender_id,
                receiver_id: receiver_id,
                content: content,
            },
        })
    }

    async getListNotificationByUser(user_id) {
        const notifications = await prisma.notification
            .findMany({
                where: {
                    receiver_id: user_id,
                },
                orderBy: {
                    created_at: 'desc',
                },
            })
            .catch((error) => {
                console.log(`Error: Noti`, error)
            })
        // update status of notification to read
        // await prisma.notification.updateMany({
        //     where: {
        //         receiver_id: user_id,
        //     },
        //     data: {
        //         is_read: true,
        //     },
        // })

        return notifications
    }
}

module.exports = new NotificationSerivce()
