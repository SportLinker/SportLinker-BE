const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const matchController = require('../controllers/match.controller')
const { authentication } = require('../middlewares/auth.middleware')

router.get('/', asyncHandler(matchController.getListMatch))

router.use(authentication)

router.post('/', asyncHandler(matchController.createNewMatch))

module.exports = router
