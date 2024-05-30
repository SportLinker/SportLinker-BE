'use strict'
const FavoriteService = require('../services/favorite.service')
const { Ok, CREATED } = require('../core/sucess.response')

class FavoriteController {
    async addNewFavorite(req, res, next) {
        new CREATED({
            message: 'Add new favorite successfully',
            metadata: await FavoriteService.addNewFavorite(req.user.id, req.body),
        }).send(res)
    }

    async getListFavoriteByUserId(req, res, next) {
        new Ok({
            message: 'Get list favorite successfully',
            metadata: await FavoriteService.getListFavoriteByUserId(req.user.id),
        }).send(res)
    }
}

module.exports = new FavoriteController()
