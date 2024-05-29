'use strict'
const prisma = require('../configs/prisma.config')
const { BadRequestError } = require('../core/error.response')
const { getPlaceDetail, isDistanceValid } = require('../helpers/place.helper')

class MatchService {
    /**
     *
     * @param {*} match
     * @param {*} user_create_id
     * @returns
     */
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

    /**
     *
     * @param {*} lat (lat origin of user)
     * @param {*} long (long origin of user)
     * @param {*} distance (meters)
     * @param {*} start_time
     * @param {*} end_time
     * @param {*} sport_name
     */
    async getListMatch(lat, long, distance, start_time, end_time, sport_name) {
        //1. Convert range time to hour
        const hour_start = new Date(start_time).getHours()
        const hour_end = new Date(end_time).getHours()
        // 2. Get list match by sport name and now
        let listMatchByTimeAndSportName = await prisma.match.findMany({
            where: {
                start_time: {
                    gte: new Date(),
                },
                sport_name: sport_name,
            },
            orderBy: {
                start_time: 'asc',
            },
        })
        // 3. Filter by hour
        listMatchByTimeAndSportName = listMatchByTimeAndSportName.filter(
            (match) => {
                let match_start_time = new Date(match.start_time).getHours()
                let match_end_time = new Date(match.end_time).getHours()
                return (
                    match_start_time >= start_time && match_end_time <= end_time
                )
            }
        )
        // 3. Filter by distance, add place detail and group by time
    }

    static groupByTime = (listMatch) => {}

    static async isDistanceValid({
        latOrigin,
        longOrigin,
        latDestination,
        longDestination,
        distanceValid,
    }) {
        // const place = await getPlaceDetail({ placeId: placeId })
        const distance = await isDistanceValid({
            latOrigin: latOrigin,
            longOrigin: longOrigin,
            latDestination: latDestination,
            longDestination: longDestination,
        })
        if (distance < distanceValid) return place
        return true
    }
}

module.exports = new MatchService()
