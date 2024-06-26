'use strict'

const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')
const { getStringHourAndMinut, getTimeByFormat } = require('../helpers/timestamp.helper')

class YardService {
    async createYard(data, stadium_id) {
        // 1. create a new yard
        const newYard = await prisma.yard.create({
            data: {
                yard_name: data.yard_name,
                yard_sport: data.yard_sport,
                yard_description: data.yard_description,
                price_per_hour: data.price_per_hour,
                stadium_id: stadium_id,
            },
        })
        // 2. Send notification to the stadium owner
        return newYard
    }

    /**
     * @function getAllYardByOwner
     * @param {*} owner_id
     */

    async getAllYardByOwner(owner_id) {
        // 1. Find all stadiums by owner id
        const stadiums_by_owner = await prisma.stadium.findMany({
            where: {
                stadium_owner_id: owner_id,
            },
        })
        // 2. Find all yards by stadium id
        const yards = await prisma.yard.findMany({
            select: {
                yard_id: true,
                yard_name: true,
                yard_description: true,
                price_per_hour: true,
                created_at: true,
                yard_sport: true,
                yard_status: true,
                BookingYard: {
                    select: {
                        id: true,
                        time_start: true,
                        time_end: true,
                        status: true,
                        created_at: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar_url: true,
                            },
                        },
                    },
                },
            },
            where: {
                stadium_id: {
                    in: stadiums_by_owner.map((stadium) => stadium.id),
                },
            },
        })
        // combine booking by time
        for (let i = 0; i < yards.length; i++) {
            const books = yards[i].BookingYard.reduce((acc, cur) => {
                const date = getTimeByFormat('yyyy-MM-DD', cur.time_start)
                cur.time_start = getStringHourAndMinut(cur.time_start)
                cur.time_end = getStringHourAndMinut(cur.time_end)
                if (!acc[date]) {
                    acc[date] = {
                        date: date,
                        matches: [],
                    }
                }

                acc[date].matches.push(cur)

                return acc
            }, [])
            yards[i].BookingYard = Object.values(books)
        }

        return yards
    }

    /**
     * @function getListYardByUser
     * @param {*} stadium_id
     * @returns yards and their bookings is accepted
     */

    async getListYardByUser(stadium_id) {
        // 1. Find all yards by stadium id
        const yards = await prisma.yard.findMany({
            select: {
                yard_id: true,
                yard_name: true,
                yard_sport: true,
                yard_description: true,
                price_per_hour: true,
                created_at: true,
                yard_status: true,
                BookingYard: {
                    select: {
                        time_start: true,
                        time_end: true,
                    },
                    where: {
                        status: 'accepted',
                        time_start: {
                            gte: new Date(),
                        },
                    },
                },
            },
            where: {
                stadium_id: stadium_id,
            },
        })
        // combine booking by time
        for (let i = 0; i < yards.length; i++) {
            const books = yards[i].BookingYard.reduce((acc, cur) => {
                const date = getTimeByFormat('yyyy-MM-DD', cur.time_start)
                cur.time_start = getStringHourAndMinut(cur.time_start)
                cur.time_end = getStringHourAndMinut(cur.time_end)
                if (!acc[date]) {
                    acc[date] = {
                        date: date,
                        matches: [],
                    }
                }

                acc[date].matches.push(cur)

                return acc
            }, [])
            yards[i].BookingYard = Object.values(books)
        }

        return yards
    }

    /**
     * @function getListYardByOwner
     * @param {*} yard_id
     * @param {*} data
     * @returns
     */

    async getListYardByOwner(stadium_id) {
        // 1. Find all yards by stadium id
        const yards = await prisma.yard.findMany({
            select: {
                yard_id: true,
                yard_name: true,
                yard_description: true,
                price_per_hour: true,
                created_at: true,
                yard_sport: true,
                yard_status: true,
                BookingYard: {
                    select: {
                        id: true,
                        time_start: true,
                        time_end: true,
                        status: true,
                        created_at: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar_url: true,
                            },
                        },
                    },
                },
                stadium: {
                    select: {
                        stadium_name: true,
                    },
                },
            },
            where: {
                stadium_id: stadium_id,
            },
            orderBy: {
                created_at: 'asc',
            },
        })
        for (let i = 0; i < yards.length; i++) {
            const books = yards[i].BookingYard.reduce((acc, cur) => {
                const date = getTimeByFormat('yyyy-MM-DD', cur.time_start)
                cur.time_start = getStringHourAndMinut(cur.time_start)
                cur.time_end = getStringHourAndMinut(cur.time_end)
                if (!acc[date]) {
                    acc[date] = {
                        date: date,
                        matches: [],
                    }
                }

                acc[date].matches.push(cur)

                return acc
            }, [])
            yards[i].BookingYard = Object.values(books)
        }
        return yards
    }

    /**
     * @function getYardById
     * @param {*} yard_id
     * @param {*} data
     * @returns
     */

    async getYardById(yard_id) {
        const yard = await prisma.yard.findUnique({
            select: {
                yard_id: true,
                yard_name: true,
                yard_description: true,
                price_per_hour: true,
                created_at: true,
                yard_sport: true,
                yard_status: true,
                BookingYard: {
                    select: {
                        id: true,
                        time_start: true,
                        time_end: true,
                        status: true,
                        created_at: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar_url: true,
                            },
                        },
                    },
                    orderBy: [
                        {
                            time_start: 'asc',
                        },
                        {
                            status: 'asc',
                        },
                    ],
                },
            },
            where: {
                yard_id: yard_id,
            },
        })

        const books = yard.BookingYard.reduce((acc, cur) => {
            const date = getTimeByFormat('yyyy-MM-DD', cur.time_start)
            cur.time_start = getStringHourAndMinut(cur.time_start)
            cur.time_end = getStringHourAndMinut(cur.time_end)
            if (!acc[date]) {
                acc[date] = {
                    date: date,
                    matches: [],
                }
            }

            acc[date].matches.push(cur)

            return acc
        }, [])
        yard.BookingYard = Object.values(books)

        return yard
    }

    async updateYard(yard_id, data) {
        return await prisma.yard.update({
            where: {
                yard_id: yard_id,
            },
            data: {
                ...data,
            },
        })
    }

    async deleteYard(yard_id) {
        return await prisma.yard.delete({
            where: {
                yard_id: yard_id,
            },
        })
    }
}

module.exports = new YardService()
