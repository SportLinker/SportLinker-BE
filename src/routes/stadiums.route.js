'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const { authentication } = require('../middlewares/auth.middleware')
const StadiumController = require('../controllers/stadium.controller')

router.use(authentication)

router.post('/', asyncHandler(StadiumController.createStadium))

router.get('/', asyncHandler(StadiumController.getStadiumByPlayer))

router.get('/getByOnwer', asyncHandler(StadiumController.getStadiumByOnwer))

router.get('/getByAdmin', asyncHandler(StadiumController.getStadiumByAdmin))

router.get('/:stadium_id', asyncHandler(StadiumController.getStadiumById))

router.put('/:stadium_id', asyncHandler(StadiumController.updateStadium))

router.delete('/:stadium_id', asyncHandler(StadiumController.deleteStadium))

// router.delete('/:id', asyncHandler(StadiumController.deleteStadium))

module.exports = router
