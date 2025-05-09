'use strict'

const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')
const NotificationSerivce = require('./notification.service')

class MatchJoinService {
    /**
     *
     * @param {*} matchId
     * @param {*} userId
     * @logic
     * 1. Check match is upcomming
     * 2. Check match is full
     * 3. Check user is include in match
     * 4. Join match
     * 5. Update total join in match
     * 6. Add user to group message join
     * 7. Send notification to owner of match
     * @returns
     */
    async joinMatch(matchId, userId) {
        //1. check match exist
        const isMatchExist = await prisma.match.findUnique({
            where: { match_id: matchId },
        })
        if (isMatchExist.status !== 'upcomming') {
            throw new BadRequestError('Match is not upcomming')
        }
        // 2. check match is full
        if (isMatchExist.total_join + 1 > isMatchExist.max_join) {
            throw new BadRequestError('Match is full')
        }
        //3. check user is include in match
        const isUserInMatch = await prisma.matchJoin.findFirst({
            where: {
                match_id: matchId,
                user_join_id: userId,
            },
        })
        if (isUserInMatch) {
            throw new BadRequestError('User already join match')
        }
        //4. join match
        await prisma.matchJoin
            .create({
                data: {
                    match_id: matchId,
                    user_join_id: userId,
                    status: 'accepted',
                },
            })
            .catch((err) => {
                throw new BadRequestError(err.message)
            })
        // 5. update total join in match
        await prisma.match.update({
            where: { match_id: matchId },
            data: {
                total_join: {
                    increment: 1,
                },
            },
        })
        console.log(matchId)
        // 6. add user to group message join
        await prisma.groupMessageJoin
            .create({
                data: {
                    group_message_id: matchId,
                    user_join_id: userId,
                },
            })
            .catch((err) => {
                console.log(`err`, err)
            })
        // get detail user join
        const userJoin = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
            },
        })
        // 7. send notification to owner of match
        await NotificationSerivce.createNotification({
            receiver_id: isMatchExist.user_create_id,
            sender_id: global.config.get(`ADMIN_ID`),
            content: `Người chơi ${userJoin.name} vừa tham gia ${isMatchExist.match_name}`,
        })
        // logs
        global.logger.info(`User ${userId} join match ${matchId}`)
        return `Join match  successfully`
    }

    /**
     * @param {string} matchId match_id
     * @param {string} body include status and user_join_id
     * @param {string} user_create_id   owner of match
     *
     */

    async updateUserJoinMatchByMatchId(matchId, body, user_create_id) {
        // 1 check match exist is upcomming and owner of match
        const isMatchExist = await prisma.match.findUnique({
            where: {
                match_id: matchId,
            },
        })
        if (!isMatchExist) throw new BadRequestError('Match is not exist')
        // check is match is upcomming
        if (isMatchExist.status !== 'upcomming') {
            throw new BadRequestError('Match is not upcomming')
        }
        // check is owner of match
        if (isMatchExist.user_create_id !== user_create_id) {
            throw new BadRequestError('You are not owner of this match')
        }
        // 2. Check user is waiting to join match
        const isUserWaiting = await prisma.matchJoin.findFirst({
            where: {
                match_id: matchId,
                user_join_id: body.user_join_id,
            },
        })
        if (!isUserWaiting) {
            throw new BadRequestError('User is not waiting to join match')
        }
        // check status is valid
        if (body.status === isUserWaiting.status)
            throw new BadRequestError(
                `User already ${body.status} in match ${isMatchExist.match_name}`
            )
        // 3. update status user_join in match
        await prisma.matchJoin.update({
            where: {
                id: isUserWaiting.id,
            },
            data: {
                status: body.status,
            },
        })
        // send notification to user
        await NotificationSerivce.createNotification({
            sender_id: user_create_id,
            receiver_id: body.user_join_id,
            content: `Your request to join match ${isMatchExist.match_name} has been ${body.status}`,
        })
        // logs
        global.logger.info(`Update status user_join in match ${matchId}`)
        // 4. return success
        return `Update status user_join in match ${isMatchExist.match_name} successfully`
    }

    async getListUserJoinMatchByOwnerId(matchId, userId) {
        // 1. check match exist
        const isMatchExist = await prisma.match.findUnique({
            where: { match_id: matchId },
        })
        if (!isMatchExist) {
            throw new BadRequestError('Match not found')
        }
        // 2. check is owner of match
        if (isMatchExist.user_create_id !== userId) {
            throw new BadRequestError('You are not owner of this match')
        }
        // 3. get list user join match by match id
        const listUserJoin = await prisma.matchJoin.findMany({
            where: {
                match_id: matchId,
            },
            select: {
                user_join: {
                    select: {
                        id: true,
                        avatar_url: true,
                        name: true,
                    },
                },
                status: true,
                time_join_at: true,
            },
        })
        // logs
        global.logger.info(`Get list user join match by match id ${matchId}`)
        // 4. return success
        return listUserJoin
    }

    /**
     *
     * @param {*} userJoinId
     * @param {*} matchId
     * @param {*} userId
     * @logic
     * 1. Check match is upcomming
     * 2. Check user join is exist
     * 3. Get detail user join
     * 4. Check is owner or user join match
     *   4.1 if owner of match delete user join match
     *       4.1.1 send notification to user
     *   4.2 if user join match leave match
     *       4.2.1 send notification to owner of match
     * 5. delete user out of group message join
     * @returns
     */
    async deleteUserJoinMatchByMatchId(userJoinId, matchId, userId) {
        // 1. check match exist is upcomming
        const isMatchExist = await prisma.match.findUnique({
            where: { match_id: matchId },
        })

        if (isMatchExist.status !== 'upcomming') {
            throw new BadRequestError('Match is not upcomming')
        }
        // 2. check user join is exist
        const matchJoin = await prisma.matchJoin.findFirst({
            where: {
                match_id: matchId,
                user_join_id: userJoinId,
            },
        })

        if (!matchJoin) {
            throw new BadRequestError('You are not join match')
        }
        // get detail user join
        const userJoin = await prisma.user.findUnique({
            where: { id: userJoinId },
            select: {
                name: true,
            },
        })
        // 4. Check is owner or user join match
        if (isMatchExist.user_create_id === userId) {
            await prisma.matchJoin.delete({
                where: {
                    id: matchJoin.id,
                },
            })
            // set total_join - 1
            await prisma.match.update({
                where: { match_id: matchId },
                data: {
                    total_join: {
                        decrement: 1,
                    },
                },
            })
            // delete user out of group message join
            const groupMessageJoin = await prisma.groupMessageJoin.findFirst({
                where: {
                    group_message_id: matchId,
                    user_join_id: userJoinId,
                },
            })
            if (groupMessageJoin) {
                await prisma.groupMessageJoin.delete({
                    where: {
                        id: groupMessageJoin.id,
                    },
                })
            }
            // send notification to user
            await NotificationSerivce.createNotification({
                content: `Owner of match ${isMatchExist.match_name} delete you from match`,
                receiver_id: userJoinId,
                sender_id: userId,
            })

            return `Remove user join match successfully`
        } else {
            if (userJoinId !== userId) {
                throw new BadRequestError('You are not user join match')
            } else {
                // delete user join match
                await prisma.matchJoin.delete({
                    where: {
                        id: matchJoin.id,
                    },
                })
                // set total_join - 1
                await prisma.match.update({
                    where: { match_id: matchId },
                    data: {
                        total_join: {
                            decrement: 1,
                        },
                    },
                })
                // delete user out of group message join
                const groupMessageJoin = await prisma.groupMessageJoin.findFirst({
                    where: {
                        group_message_id: matchId,
                        user_join_id: userJoinId,
                    },
                })
                if (groupMessageJoin) {
                    await prisma.groupMessageJoin.delete({
                        where: {
                            id: groupMessageJoin.id,
                        },
                    })
                }
                // send notification to owner of match
                await NotificationSerivce.createNotification({
                    content: `User ${userJoin.name} leave match ${isMatchExist.match_name}`,
                    receiver_id: isMatchExist.user_create_id,
                    sender_id: userJoinId,
                })
                return `Leave match successfully`
            }
        }
    }
}

module.exports = new MatchJoinService()
