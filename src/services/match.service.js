'use strict'
const prisma = require('../configs/prisma.config')
const { BadRequestError } = require('../core/error.response')
const { getPlaceDetail, getDistance } = require('../helpers/place.helper')
const {
    getUCLHourAndMinute,
    getStringHourAndMinut,
} = require('../helpers/timestamp.helper')

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
        global.logger.info(`Create new match: ${newMatch.id} by user: ${user_create_id}`)
        return newMatch
    }

    /**
     *
     * @param {*} lat (lat origin of user)
     * @param {*} long (long origin of user)
     * @param {*} distance string (meters)
     * @param {*} start_time float (hour of day)
     * @param {*} end_time float (hour of day)
     * @param {*} sport_name
     */
    async getListMatch(lat, long, distance, start_time, end_time, sport_name) {
        // 1. Get list match by sport name, now time and filter by time
        let listMatchByTimeAndSportName = await prisma.match.findMany({
            where: {
                start_time: {
                    gte: new Date(),
                },
                sport_name: sport_name,
                status: 'upcomming',
            },
            orderBy: {
                start_time: 'asc',
            },
            select: {
                match_id: true,
                match_name: true,
                place_id: true,
                sport_name: true,
                total_join: true,
                maximum_join: true,
                start_time: true,
                status: true,
                match_join: {
                    where: {
                        status: 'accepted',
                    },
                    select: {
                        user_join: {
                            select: {
                                id: true,
                                name: true,
                                avatar_url: true,
                            },
                        },
                    },
                },
            },
        })
        // Define listMatchByDistanceValid
        let listMatchByDistanceValid = []
        // 3. Filter by distance and time
        for (let i = 0; i < listMatchByTimeAndSportName.length; i++) {
            // get start time of match
            let match_start_time =
                new Date(listMatchByTimeAndSportName[i].start_time).getHours() +
                new Date(listMatchByTimeAndSportName[i].start_time).getMinutes() / 60
            console.log('match_start_time::', match_start_time)
            // 1. Get detail place of match
            const placeDetail = await getPlaceDetail({
                placeId: listMatchByTimeAndSportName[i].place_id,
            })
            // 2. Check distance of user and match
            const distanceMatrix = await getDistance({
                latOrigin: lat,
                longOrigin: long,
                latDestination: placeDetail.latitude,
                longDestination: placeDetail.longitude,
            })
            // 3. If valid distance and time valid push detail place to listMatch
            // check distance and time
            if (
                distanceMatrix.value <= distance &&
                start_time <= match_start_time &&
                end_time >= match_start_time
            ) {
                listMatchByTimeAndSportName[i].place_detail = placeDetail
                listMatchByTimeAndSportName[i].distance = distanceMatrix
                listMatchByDistanceValid.push(listMatchByTimeAndSportName[i])
            }
        }
        // 4. Group by start_time
        const result = listMatchByDistanceValid.reduce((acc, match) => {
            const start_time = getStringHourAndMinut(match.start_time)
            if (!acc[start_time]) {
                acc[start_time] = {
                    start_time: start_time,
                    matches: [],
                }
            }
            acc[start_time].matches.push(match)
            return acc
        }, {})
        // 5. Return result
        return Object.values(result)
    }
}

module.exports = new MatchService()
