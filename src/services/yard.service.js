'use strict'

const prisma = require('../configs/prisma.config').client
const { BadRequestError } = require('../core/error.response')

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

    async getYards(stadium_id) {
        // 1. Find all yards by stadium id
        return await prisma.yard.findMany({
            where: {
                stadium_id: stadium_id,
            },
        })
    }
}

module.exports = new YardService()
