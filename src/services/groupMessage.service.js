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
        })
        return groupMessage
    }
}

module.exports = new GroupMessageService()
