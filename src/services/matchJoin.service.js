'use strict'

const prisma = require('../configs/prisma.config')
const { BadRequestError } = require('../core/error.response')

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
        //5. update total join
        await prisma.match
            .update({
                where: { match_id: matchId },
                data: {
                    total_join: {
                        increment: 1,
                    },
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

    // joinMatchStrateries(type) {}
}

module.exports = new MatchJoinService()
