const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const { authentication } = require('../middlewares/auth.middleware')
const FavoriteController = require('../controllers/favorite.controller')

router.use(authentication)

router.get('/', asyncHandler(FavoriteController.getListFavoriteByUserId))

router.post('/', authentication, asyncHandler(FavoriteController.addNewFavorite))

module.exports = router
