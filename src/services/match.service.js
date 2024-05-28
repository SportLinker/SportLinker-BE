'use strict'
const prisma = require('../configs/prisma.config')
const { BadRequestError } = require('../core/error.response')

class MatchService {
    async createNewMatch(match, user_create_id) {
        // convert time
        match.start_time = new Date(match.start_time)
        match.end_time = new Date(match.end_time)
        // find match exist
        const matchExist = await prisma.match
            .findFirst({
                where: {
                    user_create_id: user_create_id,
                    start_time: match.start_time,
                    status: 'upcomming',
                },
            })
            .catch((error) => {
                throw new BadRequestError(error)
            })
        if (matchExist) throw new BadRequestError('You have a match upcomming!')
        // create new match
        const newMatch = await prisma.match.create({
            data: {
                match_name: match.match_name,
                user_create_id: user_create_id,
                place_id: match.place_id,
                sport_name: match.sport_name,
                maximum_join: match.maximum_join,
                start_time: match.start_time,
                end_time: match.end_time,
            },
        })
        // create match join for user create
        const newUserJoin = await prisma.matchJoin
            .create({
                data: {
                    user_join_id: user_create_id,
                    match_id: newMatch.match_id,
                    status: 'accepted',
                },
            })
            .catch((error) => {
                throw new BadRequestError(error)
            })
        if (!newUserJoin) throw new BadRequestError('Create match join fail!')
        // create match stadium info

        // logs
        global.logger.info(
            `Create new match: ${newMatch.id} by user: ${user_create_id}`
        )
        return newMatch
    }
}

module.exports = new MatchService()
