'use strict'

const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')
const NotificationSerivce = require('./notification.service')

class MessageService {
    /**
     * @param {*} groupMessageId
     * @param {*} userId
     * @logic
     * 1. Get list message
     * 2. Check message is of user
     * 3. Return list message
     * 4. Update notification message is seen
     */
    async getListMessageByGroupMessageId(groupMessageId, userId) {
        // get list message
        const listMessage = await prisma.message.findMany({
            where: {
                message_to: groupMessageId,
            },
            select: {
                content: true,
                created_at: true,
                user_from: {
                    select: {
                        avatar_url: true,
                        name: true,
                        id: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        })
        // check message of user
        for (let i = 0; i < listMessage.length; i++) {
            if (listMessage[i].user_from.id === userId) {
                listMessage[i].is_me = true
            } else {
                listMessage[i].is_me = false
            }
        }
        // update notification message is seen
        await prisma.notificationMessage.updateMany({
            where: {
                message_id: {
                    in: listMessage.map((message) => message.message_id),
                },
                user_id: userId,
            },
            data: {
                is_seen: true,
            },
        })
        return listMessage
    }

    /**
     *
     * @param {*} groupMessageId
     * @param {*} userId
     * @param {*} content
     * @logic
     * 1. Create message
     * 2. Update active for group message (last_active_time) for sort group message
     * 3. Create notification message for user join group message
     */
    async createMessage(groupMessageId, userId, content) {
        // create message
        const message = await prisma.message.create({
            data: {
                content: content,
                message_to: groupMessageId,
                message_from: userId,
            },
        })
        // update active for group message
        await prisma.groupMessage.update({
            where: {
                group_message_id: groupMessageId,
            },
            data: {
                last_active_time: new Date(),
            },
        })
        // create notification message for user join group message
        const userJoinGroupMessage = await prisma.groupMessageJoin.findMany({
            where: {
                group_message_id: groupMessageId,
                user_join_id: {
                    not: userId,
                },
            },
        })
        // update is_seen true for user
        await prisma.notificationMessage.create({
            data: {
                message_id: message.message_id,
                user_id: userId,
                is_seen: true,
            },
        })
        for (let i = 0; i < userJoinGroupMessage.length; i++) {
            await prisma.notificationMessage.create({
                data: {
                    message_id: message.message_id,
                    user_id: userJoinGroupMessage[i].user_join_id,
                },
            })
        }

        return message
    }
}

module.exports = new MessageService()
