'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../helpers/asyncHandler.helper')
const NotificationController = require('../controllers/notification.controller')
const { authentication } = require('../middlewares/auth.middleware')

router.use(authentication)

router.get('/', asyncHandler(NotificationController.getListNotificationByUser))

module.exports = router
