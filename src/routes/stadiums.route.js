'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const { authentication } = require('../middlewares/auth.middleware')
const StadiumController = require('../controllers/stadium.controller')

router.use(authentication)

router.post('/', asyncHandler(StadiumController.createStadium))

router.get('/', asyncHandler(StadiumController.getStadiumByPlayer))

router.get('/getByOwner', asyncHandler(StadiumController.getStadiumByOwner))

router.get('/getByAdmin', asyncHandler(StadiumController.getStadiumByAdmin))

router.get('/:stadium_id', asyncHandler(StadiumController.getStadiumById))

router.put('/:stadium_id', asyncHandler(StadiumController.updateStadium))

router.patch('/:stadium_id', asyncHandler(StadiumController.updateStatusStadium))

router.delete('/:stadium_id', asyncHandler(StadiumController.deleteStadium))

router.post('/rating/:stadium_id', asyncHandler(StadiumController.createRating))

module.exports = router
