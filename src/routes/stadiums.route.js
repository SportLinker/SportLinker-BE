'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const { authentication } = require('../middlewares/auth.middleware')
const StadiumController = require('../controllers/stadium.controller')

router.use(authentication)

router.post('/', asyncHandler(StadiumController.createStadium))

router.get('/', asyncHandler(StadiumController.getStadiums))

// router.get('/:id', asyncHandler(StadiumController.getStadiumById))

// router.put('/:id', asyncHandler(StadiumController.updateStadium))

// router.delete('/:id', asyncHandler(StadiumController.deleteStadium))

module.exports = router
