'use strict'

const redis = require('../configs/redis.config').client
const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')

class GroupMessageService {
    /**
     *
     * @param {*} userId
     * @logic
     * 1. Get group message join by user
     * 2. Get group message by group message join
     * 3. Get last message of group message
     * 4. Get notification message to check is seen
     * @returns
     */
    async getListGroupMessageByUser(userId, search) {
        if (!search) search = ''
        // Get group message join by user
        const groupMessageJoinByUser = await prisma.groupMessageJoin
            .findMany({
                where: {
                    user_join_id: userId,
                },
            })
            .catch((error) => {
                global.logger.error(`Error: ${error.message}`)
                return
            })
        // get group message id
        let id
        if (groupMessageJoinByUser) {
            id = groupMessageJoinByUser.map(
                (groupMessageJoin) => groupMessageJoin.group_message_id
            )
        } else {
            return []
        }
        // Get group message by user
        const groupMessage = await prisma.groupMessage
            .findMany({
                where: {
                    group_message_id: {
                        in: id,
                    },
                    group_message_name: {
                        contains: search,
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
                include: {
                    GroupMessageJoin: true,
                },
            })
            .catch((error) => {
                global.logger.error(`Error get list message: ${error.message}`)
                return
            })
        // Get last message of group message
        for (let i = 0; i < groupMessage.length; i++) {
            // set back group message name
            if (groupMessage[i].type === 'single') {
                const groupMessageJoinOfUserMessage =
                    await prisma.groupMessageJoin.findFirst({
                        where: {
                            group_message_id: groupMessage[i].group_message_id,
                            user_join_id: {
                                not: userId,
                            },
                        },
                        include: {
                            user_join: true,
                        },
                    })
                // set group message name to name of user
                groupMessage[i].group_message_name =
                    groupMessageJoinOfUserMessage.user_join.name

                groupMessage[i].group_message_thumnail =
                    groupMessageJoinOfUserMessage.user_join.avatar_url
            }

            const lastMessage = await prisma.message.findFirst({
                where: {
                    message_to: groupMessage[i].group_message_id,
                },
                orderBy: {
                    created_at: 'desc',
                },
            })
            if (lastMessage) {
                groupMessage[i].last_message = lastMessage.content
                // get notification message to check is seen
                const notification_message = await prisma.notificationMessage.findFirst({
                    where: {
                        message_id: lastMessage.message_id,
                        user_id: userId,
                    },
                    select: {
                        is_seen: true,
                    },
                })
                if (notification_message) {
                    groupMessage[i].is_seen = notification_message.is_seen
                } else {
                    groupMessage[i].is_seen = false
                }
            } else {
                groupMessage[i].last_message = `Hãy bắt đầu cuộc trò chuyện`
                groupMessage[i].is_seen = false
            }
        }
        return groupMessage
    }

    /**
     *
     * @param {*} data
     * @param {*} userId
     * @logic
     * 1. Create group message
     * 2. Create group message join
     * 3. Create message
     * 4. Create notification message
     * @returns
     */

    async createGroupMessage(userMessageId, userId) {
        // get detail use message and user id
        const userMessage = await prisma.user.findFirst({
            where: {
                id: userMessageId,
            },
        })

        const user = await prisma.user.findFirst({
            where: {
                id: userId,
            },
        })

        // check group message
        const groupMessage = await prisma.groupMessage.findFirst({
            where: {
                group_message_name: {
                    contains: `${user.name}-${userMessage.name}-${userMessageId}-${userId}`,
                },
                type: 'single',
            },
        })
        if (groupMessage) {
            return groupMessage
        }
        // create group message
        const newGroupMessage = await prisma.groupMessage.create({
            data: {
                group_message_name: `${user.name}-${userMessage.name}-${userMessageId}-${userId}`,
                type: 'single',
            },
        })
        // create join group message for user and user message
        await prisma.groupMessageJoin.createMany({
            data: [
                {
                    user_join_id: userId,
                    group_message_id: newGroupMessage.group_message_id,
                },
                {
                    user_join_id: userMessageId,
                    group_message_id: newGroupMessage.group_message_id,
                },
            ],
        })

        return newGroupMessage
    }
}

module.exports = new GroupMessageService()
