'use strict'

const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')
const NotificationSerivce = require('./notification.service')

class MatchJoinService {
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
        // get detail user join
        const userJoin = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
            },
        })
        // send notification to owner of match
        await NotificationSerivce.createNotification({
            sender_id: userId,
            receiver_id: isMatchExist.user_create_id,
            content: `User ${userJoin.name} join match ${isMatchExist.match_name}`,
        })
        // logs
        global.logger.info(`User ${userId} join match ${matchId}`)
        // 6. return succes
        return `User join match  successfully. Please wait for the owner to accept you.`
    }

    /**
     * @param {string} matchId match_id
     * @param {string} body include status and user_join_id
     * @param {string} user_create_id   owner of match
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
        // 3. get detail user join
        const userJoin = await prisma.user.findUnique({
            where: { id: userJoinId },
            select: {
                name: true,
            },
        })
        // 4. Check is onwer or user join match
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
