'use strict'
const prisma = require('../configs/prisma.config')
const { BadRequestError } = require('../core/error.response')
const redis = require('../configs/redis.config').client
const { getPlaceDetail, getDistance } = require('../helpers/place.helper')
const {
    getUCLHourAndMinute,
    getStringHourAndMinut,
    getStringByDate,
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
                cid: match.cid,
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
        // create match option
        await prisma.matchOption.create({
            data: {
                match_id: newMatch.match_id,
                budget: match.option.budget,
            },
        })
        // Check cache stadium info is exist
        const stadiumInfo = await redis.get(`stadium:${match.cid}`)
        if (!stadiumInfo) {
            // get detail place of match
            const placeDetail = await getPlaceDetail({
                cid: match.cid,
            })
            // set cache stadium info
            await redis.set(`stadium:${match.cid}`, JSON.stringify(placeDetail))
        }
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
     * @param {*} sport_name array (sport name)
     */
    async getListMatch(lat, long, distance, start_time, end_time, sport_name, user_id) {
        //
        sport_name = sport_name.split(',')
        // 1. Get list match by sport name, now time and filter by time
        let listMatchByTimeAndSportName = await prisma.match.findMany({
            where: {
                start_time: {
                    gte: new Date(),
                },
                sport_name: {
                    in: sport_name,
                },
                status: 'upcomming',
            },
            orderBy: {
                start_time: 'asc',
            },
            select: {
                match_id: true,
                match_name: true,
                cid: true,
                sport_name: true,
                total_join: true,
                maximum_join: true,
                start_time: true,
                status: true,
                user_create_id: true,
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
        // if list match empty return empty list
        if (listMatchByTimeAndSportName.length === 0) return []
        let list_match_by_distance_and_time = []
        // 3. Filter by distance and time
        for (let i = 0; i < listMatchByTimeAndSportName.length; i++) {
            // get start time of match
            let match_start_time =
                new Date(listMatchByTimeAndSportName[i].start_time).getHours() +
                new Date(listMatchByTimeAndSportName[i].start_time).getMinutes() / 60
            // 1. Get detail place of match
            let placeDetail = await redis.get(
                `stadium:${listMatchByTimeAndSportName[i].cid}`
            )
            placeDetail = JSON.parse(placeDetail)
            if (!placeDetail) {
                placeDetail = await getPlaceDetail({
                    cid: listMatchByTimeAndSportName[i].cid,
                })
                await redis.set(
                    `stadium:${listMatchByTimeAndSportName[i].cid}`,
                    JSON.stringify(placeDetail)
                )
            }
            // wait distance matrix to 30s
            await new Promise((resolve) => setTimeout(resolve, 150))

            // 2. Check distance of user and match
            let distanceMatrix = await getDistance({
                latOrigin: lat,
                longOrigin: long,
                latDestination: placeDetail.latitude,
                longDestination: placeDetail.longitude,
            })
            distanceMatrix = distanceMatrix.rows[0].elements[0].distance
            console.log(`Distance: ${distanceMatrix.value}`)
            // 3. Check is owner of match
            if (listMatchByTimeAndSportName[i].user_create_id === user_id) {
                listMatchByTimeAndSportName[i].is_owner = true
            } else {
                listMatchByTimeAndSportName[i].is_owner = false
            }
            // 4. If valid distance and time valid push detail place to listMatch
            if (
                distanceMatrix.value <= distance &&
                start_time <= match_start_time &&
                end_time >= match_start_time
            ) {
                listMatchByTimeAndSportName[i].place_detail = placeDetail
                listMatchByTimeAndSportName[i].distance = distanceMatrix
                list_match_by_distance_and_time.push(listMatchByTimeAndSportName[i])
            }
        }
        // 4. Group by day
        let result = list_match_by_distance_and_time.reduce((acc, match) => {
            const date = getStringByDate(match.start_time)
            if (!acc[date]) {
                acc[date] = {
                    date: date,
                    match_group_by_date: [],
                }
            }
            acc[date].match_group_by_date.push(match)
            return acc
        }, {})
        result = Object.values(result)
        // loop to group by start_time
        for (let i = 0; i < result.length; i++) {
            const match_group_by_time = result[i].match_group_by_date.reduce(
                (acc, match) => {
                    const time = getStringHourAndMinut(match.start_time)
                    if (!acc[time]) {
                        acc[time] = {
                            time: time,
                            matches: [],
                        }
                    }
                    acc[time].matches.push(match)
                    return acc
                },
                {}
            )
            result[i].match_group_by_date = Object.values(match_group_by_time)
        }
        // 5. Return result
        return result
    }

    /**
     *
     * @param {*} match_id
     */

    async getMatchDetail(match_id) {
        // 1. Get match detail
        const matchDetail = await prisma.match
            .findUnique({
                where: {
                    match_id: match_id,
                },
                select: {
                    match_id: true,
                    match_name: true,
                    place_id: true,
                    sport_name: true,
                    total_join: true,
                    maximum_join: true,
                    start_time: true,
                    end_time: true,
                    status: true,
                    created_at: true,
                    user_create: {
                        select: {
                            id: true,
                            name: true,
                            avatar_url: true,
                        },
                    },
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
            .catch((error) => {
                throw new BadRequestError(error)
            })
        // 2. Get detail place of match
        const placeDetail = await getPlaceDetail({
            placeId: matchDetail.place_id,
        })
        matchDetail.place_detail = placeDetail
        // 3. Return result
        return matchDetail
    }

    /**
     *
     * @param {*} match_id
     * @param {*} user_id
     */

    async deleteMatch(match_id, user_id) {
        // 1. Check user is user create of match
        const match = await prisma.match
            .findUnique({
                where: {
                    match_id: match_id,
                },
            })
            .catch((error) => {
                throw new BadRequestError(error)
            })
        if (match.user_create_id !== user_id) {
            throw new BadRequestError('You are not user create of this match!')
        }
        // 2. Delete match
        const deleteMatch = await prisma.match
            .update({
                where: {
                    match_id: match_id,
                },
                data: {
                    status: 'cancelled',
                },
            })
            .catch((error) => {
                throw new BadRequestError(error)
            })
        // 3. Return result
        return deleteMatch
    }

    /**
     *
     * @param {*} match_id
     * @param {*} user_id
     * @param {*} data
     */

    async updateMatch(match_id, user_id, data) {
        // 1. Check user is user create of match
        const match = await prisma.match
            .findUnique({
                where: {
                    match_id: match_id,
                },
            })
            .catch((error) => {
                throw new BadRequestError(error)
            })
        if (match.user_create_id !== user_id) {
            throw new BadRequestError('You are not user create of this match!')
        }
        // 2. Update match
        const updateMatch = await prisma.match
            .update({
                where: {
                    match_id: match_id,
                },
                data: {
                    ...data,
                },
            })
            .catch((error) => {
                throw new BadRequestError(error)
            })
        // 3. Update match option
        await prisma.matchOption
            .update({
                where: {
                    match_id: match_id,
                },
                data: {
                    ...data.option,
                },
            })
            .catch((error) => {
                throw new BadRequestError(error)
            })
        // 3. Return result
        return updateMatch
    }
}

module.exports = new MatchService()
