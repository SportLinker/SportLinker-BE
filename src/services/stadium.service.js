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

    StadiumStrategies = {
        stadium: this.getListStadiumByOwner,
        player: this.getListStadiumByPlayer,
        admin: this.getListStadiumByAdmin,
    }

    async getStadiums(userId, role, lat, long) {
        return this.StadiumStrategies[role](userId, lat, long)
    }

    async getListStadiumByOwner(userId, lat = null, long = null) {
        return prisma.stadium.findMany({
            where: {
                stadium_owner_id: userId,
            },
        })
    }

    async getListStadiumByPlayer(userId, lat = null, long = null) {
        return prisma.stadium.findMany({
            orderBy: {
                stadium_status: 'asc',
            },
        })
    }

    async getListStadiumByAdmin(userId, lat, long) {
        const list_stadium = prisma.stadium.findMany({
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
}

module.exports = new StadiumService()
