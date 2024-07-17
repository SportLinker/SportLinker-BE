'use strict'

const { BadRequestError } = require('../core/error.response')
const prisma = require('../configs/prisma.config').client
const { getStringByDate, getStringHourAndMinut } = require('../helpers/timestamp.helper')
const { getPlaceDetail, getDistance } = require('../helpers/place.helper')
const redis = require('../configs/redis.config').client

class SearchService {
    searchStrategy = {
        user: this.searchUser,
        match: this.searchMatch,
        stadium: this.searchStadium,
    }

    async search(pageSize, pageNumber, search, type, lat, long, userId) {
        return this.searchStrategy[type](pageSize, pageNumber, search, lat, long, userId)
    }
    // search user
    async searchUser(pageSize, pageNumber, search, lat, long, userId) {
        // parse page size and page number
        pageSize = parseInt(pageSize)
        pageNumber = parseInt(pageNumber)
        // search user by search and type
        const users = await prisma.user
            .findMany({
                where: {
                    name: {
                        contains: search,
                    },
                    status: 'active',
                    role: 'player',
                    id: {
                        not: userId,
                    },
                },
                take: pageSize,
                skip: pageSize * (pageNumber - 1),
            })
            .catch((err) => {
                console.log('Error search user', err)
            })
        return users
    }

    // search match

    async searchMatch(pageSize, pageNumber, search, lat, long, userId) {
        // parse page size and page number
        pageSize = parseInt(pageSize)
        pageNumber = parseInt(pageNumber)
        // search match by search and type
        let matches = await prisma.match
            .findMany({
                include: {
                    match_join: {
                        where: {
                            status: 'accepted',
                        },
                        include: {
                            user_join: true,
                        },
                    },
                },
                where: {
                    match_name: {
                        contains: search,
                    },
                    status: 'upcomming',
                },
                take: pageSize,
                skip: pageSize * (pageNumber - 1),
                orderBy: {
                    start_time: 'asc',
                },
            })
            .catch((err) => {
                console.log('Error search match', err)
            })

        for (let i = 0; i < matches.length; i++) {
            // 1. Get detail place of match
            let placeDetail = await redis.get(`stadium:${matches[i].cid}`)
            placeDetail = JSON.parse(placeDetail)
            if (!placeDetail) {
                placeDetail = await getPlaceDetail({
                    cid: matches[i].cid,
                })
                await redis.set(`stadium:${matches[i].cid}`, JSON.stringify(placeDetail))
            }
            // wait distance matrix to 30s
            await new Promise((resolve) => setTimeout(resolve, 200))

            matches[i].place_detail = placeDetail
        }

        let result = matches.reduce((acc, match) => {
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
        return result
    }
    // search stadium
    async searchStadium(pageSize, pageNumber, search, lat, long, userId) {
        // parse page size and page number
        pageSize = parseInt(pageSize)
        pageNumber = parseInt(pageNumber)
        // search stadium by search and type
        const stadiums = await prisma.stadium
            .findMany({
                where: {
                    stadium_name: {
                        contains: search,
                    },
                    stadium_status: 'approved',
                },
                take: pageSize,
                skip: pageSize * (pageNumber - 1),
                include: {
                    owner: true,
                },
            })
            .catch((err) => {
                console.log('Error Search stadium', err)
            })

        for (let i = 0; i < stadiums.length; i++) {
            // wait 150ms
            await new Promise((resolve) => setTimeout(resolve, 150))
            const distance = await getDistance({
                latOrigin: lat,
                longOrigin: long,
                latDestination: stadiums[i].stadium_lat,
                longDestination: stadiums[i].stadium_long,
            })
            // set distance
            stadiums[i].distance = distance.rows[0].elements[0].distance
            // find total rating
            const total_rating = await prisma.stadiumRating.count({
                where: {
                    stadium_id: stadiums[i].id,
                },
            })
            stadiums[i].total_rating = total_rating
        }

        return stadiums
    }
}

module.exports = new SearchService()
