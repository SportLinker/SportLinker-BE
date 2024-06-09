'use strict'

const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')
const NotificationSerivce = require('./notification.service')

class MessageService {
    async getListMessageByGroupMessageId(groupMessageId, userId) {
        // get list message
        const listMessage = await prisma.message.findMany({
            where: {
                message_to: groupMessageId,
            },
        })
    }
}

module.exports = new MessageService()
