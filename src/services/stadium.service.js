'use strict'

const { BadRequestError } = require('../core/error.response')
const prisma = require('../configs/prisma.config').client
const { getDistance } = require('../helpers/place.helper')

class StadiumService {
    /**
     * @function createStadium
     * @param {*} data
     * @param {*} userId
     * @logic
     * 1. Find the stadium by long lat
     * 2. If stadium exists, return bad request
     * 3. If stadium does not exist, create stadium
     * 4. Return stadium
     */
    async createStadium(data, userId) {
        // 1. Find the stadium by long lat
        const isStadiumExist = await prisma.stadium.findFirst({
            where: {
                stadium_lat: data.stadium_lat,
                stadium_long: data.stadium_long,
            },
        })
        if (isStadiumExist) {
            throw new BadRequestError('Stadium already exists with the same location.')
        }
        // 2. create stadium
        const stadium = await prisma.stadium.create({
            data: {
                stadium_owner_id: userId,
                stadium_name: data.stadium_name,
                stadium_lat: data.stadium_lat,
                stadium_long: data.stadium_long,
                stadium_address: data.stadium_address,
                stadium_thumnail: data.stadium_thumnail,
                stadium_time: data.stadium_time,
                stadium_description: data.stadium_description,
            },
        })
        // 3, Create notification to admin
        // await prisma.notification.create({
        //     data: {
        //         content: `New stadium created with name ${stadium.stadium_name}`,
        //         receiver_id
        //     },
        // })
        // 4. Return stadium
        return stadium
    }

    /**
     * @function updateStadium
     * @param {*} lat
     * @param {*} long
     * @logic
     * 1. Get all stadium
     * 2. Calculate distance
     * 3. Sort by distance
     * 4. Return list stadium
     */

    async getStadiumByPlayer(lat, long) {
        const list_stadium = await prisma.stadium.findMany({
            where: {
                stadium_status: 'approved',
            },
        })
        // get distance and sort by distance
        for (let i = 0; i < list_stadium.length; i++) {
            const distance = await getDistance({
                latOrigin: lat,
                longOrigin: long,
                latDestination: list_stadium[i].stadium_lat,
                longDestination: list_stadium[i].stadium_long,
            })
            list_stadium[i].distance = distance.rows[0].elements[0].distance.value
        }
        list_stadium.sort((a, b) => a.distance - b.distance)
        return list_stadium
    }

    /**
     * @function getStadiumByOnwer
     * @param {*} userId
     * @logic
     * 1. Find stadium by owner
     * 2. Return list stadium
     */

    async getStadiumByOnwer(userId) {
        const list_stadium = await prisma.stadium.findMany({
            where: {
                stadium_owner_id: userId,
            },
        })

        return list_stadium
    }

    /**
     * @function getStadiumByAdmin
     * @logic
     * 1. Get all stadium
     * 2. Return list stadium
     * 3. Order by status and created_at
     * 4. Return list stadium
     */

    async getStadiumByAdmin() {
        const list_stadium = await prisma.stadium.findMany({
            select: {
                stadium_name: true,
                stadium_address: true,
                stadium_thumnail: true,
                stadium_time: true,
                stadium_description: true,
                stadium_status: true,
                created_at: true,
                stadium_owner: {
                    select: {
                        user_id: true,
                        user_name: true,
                        user_email: true,
                        user_phone: true,
                    },
                },
            },
            orderBy: {
                stadium_status: 'desc',
                created_at: 'desc',
            },
        })
        return list_stadium
    }

    /**
     * @function getStadiumById
     * @param {*} stadiumId
     * @logic
     * 1. Find stadium by id
     * 2. return stadium
     */

    async getStadiumById(stadiumId) {
        const stadium = await prisma.stadium.findFirst({
            select: {
                stadium_name: true,
                stadium_address: true,
                stadium_description: true,
                stadium_thumnail: true,
                stadium_time: true,
                stadium_status: true,
                created_at: true,
                yards: {
                    select: {
                        yard_id: true,
                        yard_name: true,
                        price_per_hour: true,
                        yard_sport: true,
                        yard_description: true,
                        yard_status: true,
                        created_at: true,
                    },
                },
            },
            where: {
                stadium_id: stadiumId,
            },
        })
        return stadium
    }

    /**
     * @function updateStadium
     * @param {*} userId
     * @param {*} stadiumId
     * @param {*} data
     * @logic
     * 1. Find stadium by id
     * 2. If stadium does not exist, return bad request
     * 3. If stadium exists, update stadium
     * 4. Return stadium
     */

    async updateStadium(userId, stadiumId, data) {
        // 1. Find stadium by id
        const stadium = await prisma.stadium.findFirst({
            where: {
                stadium_id: stadiumId,
            },
        })
        if (!stadium) {
            throw new BadRequestError('Stadium does not exist.')
        }
        // 2. check is owner
        if (stadium.stadium_owner_id !== userId) {
            throw new BadRequestError('You are not the owner of this stadium.')
        }
        // 3. Update stadium
        const updatedStadium = await prisma.stadium.update({
            where: {
                stadium_id: stadiumId,
            },
            data: {
                ...data,
            },
        })

        return updatedStadium
    }

    /**
     * @function deleteStadium
     * @param {*} stadiumId
     * @logic
     * 1. Find stadium by id
     * 2. If stadium does not exist, return bad request
     * 3. If stadium exists, delete stadium
     * 4. Return stadium
     */

    async deleteStadium(stadiumId) {
        // 1. find all yard in stadium
        const list_yard = await prisma.yard.findMany({
            where: {
                stadium_id: stadiumId,
            },
        })
        // 2. delete all yard in stadium
        for (let i = 0; i < list_yard.length; i++) {
            await prisma.yard.delete({
                where: {
                    yard_id: list_yard[i].yard_id,
                },
            })
        }
        // 3. delete stadium
        const stadium = await prisma.stadium.delete({
            where: {
                stadium_id: stadiumId,
            },
        })

        return stadium
    }
}

module.exports = new StadiumService()
