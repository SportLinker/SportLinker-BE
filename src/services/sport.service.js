'use strict'
const prisma = require('../configs/prisma.config')

class SportSerive {
    async getListSport() {
        return await prisma.sport.findMany()
    }

    async createNewSport(sport_name) {
        return await prisma.sport.create({
            data: {
                sport_name: sport_name,
            },
        })
    }
}

module.exports = new SportSerive()
