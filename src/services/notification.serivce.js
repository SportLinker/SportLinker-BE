'use strict'

const prisma = require('../configs/prisma.config')
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
}

module.exports = new NotificationSerivce()
