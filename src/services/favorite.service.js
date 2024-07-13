'use strict'
const redis = require('../configs/redis.config').client
const { BadRequestError } = require('../core/error.response')

class FavoriteService {
    async addNewFavorite(userId, data) {
        await redis.set(`favorite:${userId}`, JSON.stringify(data)).catch((err) => {
            throw new BadRequestError(err)
        })
        return data
    }

    async getListFavoriteByUserId(userId) {
        const data = await redis.get(`favorite:${userId}`).catch((err) => {
            throw new BadRequestError(err)
        })

        return JSON.parse(data)
    }
}

module.exports = new FavoriteService()
