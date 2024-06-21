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
                message_id: true,
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
        // Get list message not seen of user in this group chat
        const list_message_not_seen_of_user = await prisma.notificationMessage.findMany({
            where: {
                message_id: {
                    in: listMessage.map((message) => message.message_id),
                },
                user_id: userId,
                is_seen: false,
            },
        })
        // loop update to seen
        for (let i = 0; i < list_message_not_seen_of_user.length; i++) {
            await prisma.notificationMessage.update({
                where: {
                    id: list_message_not_seen_of_user[i].id,
                },
                data: {
                    is_seen: true,
                },
            })
        }
        // get detail group message
        const groupMessage = await prisma.groupMessage.findUnique({
            where: {
                group_message_id: groupMessageId,
            },
            select: {
                group_message_id: true,
                group_message_name: true,
                group_message_thumnail: true,
                type: true,
            },
        })
        // check if group message is type 1 (1: private chat, 2: group chat)
        if (groupMessage.type === 'single') {
            // get user in group message
            const userInGroupMessage = await prisma.groupMessageJoin.findMany({
                where: {
                    group_message_id: groupMessageId,
                    user_join_id: {
                        not: userId,
                    },
                },
                select: {
                    user_join_id: true,
                    user: {
                        select: {
                            avatar_url: true,
                            name: true,
                            id: true,
                        },
                    },
                },
            })
            // check user in group message
            if (userInGroupMessage.length === 0) {
                throw new BadRequestError('User not in group message')
            }
            groupMessage.group_message_id = userInGroupMessage[0].user_join_id
            groupMessage.group_message_name = userInGroupMessage[0].user.name
            groupMessage.group_message_thumnail = userInGroupMessage[0].user.avatar_url
            return {
                group_message_detail: groupMessage,
                messages: listMessage,
            }
        }
        // return group message detail and list message
        return {
            group_message_detail: groupMessage,
            messages: listMessage,
        }
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

    async createMessageBySocket(message_id, message_from, content, created_at) {
        const user_from = await prisma.user.findUnique({
            select: {
                avatar_url: true,
                name: true,
                id: true,
            },
            where: {
                id: message_from,
            },
        })
        return {
            message_id: message_id,
            content: content,
            created_at: created_at,
            user_from: user_from,
            is_me: false,
        }
    }
}

module.exports = new MessageService()
