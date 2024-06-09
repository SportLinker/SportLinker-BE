'use strict'

const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')

class SportSerive {
    async getListSport() {
        return await prisma.sport.findMany()
    }

    async createNewSport(sport_name) {
        // Check if sport_name is already exist
        const sport = await prisma.sport.findUnique({
            where: {
                sport_name: sport_name,
            },
        })
        if (sport) throw new BadRequestError('Sport already exist')

        //
        return await prisma.sport.create({
            data: {
                sport_name: sport_name,
            },
        })
    }
}

module.exports = new SportSerive()
