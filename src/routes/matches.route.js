const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const matchController = require('../controllers/match.controller')

router.post('/', asyncHandler(matchController.createNewMatch))

// router.post('/logout', asyncHandler(AuthenController.logout))

// router.post('/forgot-password', asyncHandler(AuthenController.forgotPassword))

module.exports = router
