'use strict'

const redis = require('../configs/redis.config').client
const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')

class GroupMessageService {
    async getListGroupMessageByUser(userId) {
        // Get group message join by user
        const groupMessageJoinByUser = await prisma.groupMessageJoin.findMany({
            where: {
                user_join_id: userId,
            },
        })
        const id = groupMessageJoinByUser.map(
            (groupMessageJoin) => groupMessageJoin.group_message_id
        )
        // Get group message by user
        const groupMessage = await prisma.groupMessage.findMany({
            where: {
                group_message_id: {
                    in: id,
                },
            },
            orderBy: [
                {
                    last_active_time: 'desc',
                },
                {
                    type: 'asc',
                },
            ],
        })
        // Get last message of group message
        for (let i = 0; i < groupMessage.length; i++) {
            const lastMessage = await prisma.message.findFirst({
                where: {
                    message_to: groupMessage[i].group_message_id,
                },
                orderBy: {
                    created_at: 'desc',
                },
            })
            if (lastMessage) {
                groupMessage[i].last_message = lastMessage
            } else {
                groupMessage[i].last_message = `Hãy bắt đầu cuộc trò chuyện`
            }
        }
        return groupMessage
    }
}

module.exports = new GroupMessageService()
