const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const SportController = require('../controllers/sport.controller')

router.get('/', asyncHandler(SportController.getListSport))
// check is admin
router.post('/', asyncHandler(SportController.createNewSport))

module.exports = router
