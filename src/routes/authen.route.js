const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const AuthenController = require('../controllers/authen.controller')

router.post('/register', asyncHandler(AuthenController.register))

router.post('/login', asyncHandler(AuthenController.login))

// router.post('/logout', asyncHandler(AuthenController.logout))

// router.post('/forgot-password', asyncHandler(AuthenController.forgotPassword))

module.exports = router
