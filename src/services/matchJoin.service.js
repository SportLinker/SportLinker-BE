'use strict'

const prisma = require('../configs/prisma.config')
const { BadRequestError } = require('../core/error.response')
const NotificationSerivce = require('./notification.serivce')

class MatchJoinService {
    async joinMatch(matchId, userId) {
        //1. check match exist
        const isMatchExist = await prisma.match.findUnique({
            where: { match_id: matchId, status: 'upcomming' },
        })
        if (!isMatchExist) {
            throw new BadRequestError('Match not found or already started')
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
                },
            })
            .catch((err) => {
                throw new BadRequestError(err.message)
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
}

module.exports = new MatchJoinService()
