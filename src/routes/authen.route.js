const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const AuthenController = require('../controllers/authen.controller')
const { authentication } = require('../middlewares/auth.middleware')

router.post('/register', asyncHandler(AuthenController.register))

router.post('/login', asyncHandler(AuthenController.login))

router.use(authentication)

router.get('/logout', asyncHandler(AuthenController.logout))

// router.post('/forgot-password', asyncHandler(AuthenController.forgotPassword))

module.exports = router
